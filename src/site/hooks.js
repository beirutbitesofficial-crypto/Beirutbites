import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, getRedirectResult, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, limit, getDocs } from "firebase/firestore";
import { auth, db, firebaseReady } from "../firebase.js";
import { normalizeSettings, CATEGORIES } from "../data/menu.js";
import { storage, tsMillis } from "../lib/utils.js";

/* Live site settings from Firestore (config/site), with settings.json as a fallback. */
export function useSettings() {
  const [settings, setSettings] = useState(() => normalizeSettings(null));

  useEffect(() => {
    let gotRemote = false;
    let cancelled = false;
    const loadFile = () => {
      if (gotRemote || location.protocol === "file:") return;
      fetch("settings.json", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => { if (json && !gotRemote && !cancelled) setSettings(normalizeSettings(json)); })
        .catch(() => {});
    };
    if (!firebaseReady) { loadFile(); return () => { cancelled = true; }; }
    const unsub = onSnapshot(
      doc(db, "config", "site"),
      (snap) => {
        if (snap.exists()) { gotRemote = true; setSettings(normalizeSettings(snap.data())); }
        else loadFile();
      },
      () => loadFile()
    );
    return () => { cancelled = true; unsub(); };
  }, []);

  return settings;
}

/* Re-render every minute so "open now" stays correct. */
export function useMinuteTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 60000);
    return () => clearInterval(id);
  }, []);
  return tick;
}

async function ensureProfile(u, nameOverride) {
  const ref = doc(db, "users", u.uid);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
    const profile = {
      name: nameOverride || u.displayName || (u.email ? u.email.split("@")[0] : "") || "",
      email: u.email || "",
      phone: u.phoneNumber || "",
      provider: (u.providerData && u.providerData[0] && u.providerData[0].providerId) || "password",
      points: 0,
      createdAt: new Date().toISOString()
    };
    await setDoc(ref, profile);
    return profile;
  } catch (err) {
    console.warn("Profile error", err);
    return { name: u.displayName || "", email: u.email || "", points: 0 };
  }
}
export { ensureProfile };

/* Logged-in customer, their points, orders and pending reward. */
export function useCustomer() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pendingReward, setPendingReward] = useState(false);

  const refresh = useCallback(async (uid) => {
    if (!firebaseReady || !uid) return;
    try {
      const [profileSnap, orderSnap, rewardSnap] = await Promise.all([
        getDoc(doc(db, "users", uid)),
        getDocs(query(collection(db, "orders"), where("uid", "==", uid), limit(30))),
        getDocs(query(collection(db, "rewards"), where("uid", "==", uid), where("status", "==", "pending"), limit(1)))
      ]);
      const list = [];
      orderSnap.forEach((d) => list.push({ ...d.data(), _id: d.id }));
      list.sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
      setOrders(list);
      setPendingReward(!rewardSnap.empty);
      if (profileSnap.exists()) setUser((u) => (u && u.uid === uid ? { ...u, ...profileSnap.data(), name: u.name || profileSnap.data().name } : u));
    } catch (err) {
      console.warn(err);
    }
  }, []);

  useEffect(() => {
    if (!firebaseReady) return undefined;
    getRedirectResult(auth).catch(() => {});
    if (isSignInWithEmailLink(auth, location.href)) {
      const email = storage("emailForSignIn") || window.prompt("E-post / Email:");
      if (email) {
        signInWithEmailLink(auth, email, location.href)
          .then(() => { storage("emailForSignIn", null); history.replaceState({}, document.title, location.pathname); })
          .catch(() => {});
      }
    }
    return onAuthStateChanged(auth, async (u) => {
      if (!u) { setUser(null); setOrders([]); setPendingReward(false); return; }
      const profile = await ensureProfile(u);
      const next = { uid: u.uid, email: u.email || "", ...profile };
      if (u.displayName) next.name = u.displayName;
      if (!next.name) next.name = (u.email || u.phoneNumber || "").split("@")[0];
      setUser(next);
      refresh(u.uid);
    });
  }, [refresh]);

  return { user, setUser, orders, pendingReward, setPendingReward, refresh };
}

/* Cart saved in the browser so it survives a reload. */
export function useCart(products) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = JSON.parse(storage("bb_cart") || "[]");
      return Array.isArray(saved) ? saved.filter((l) => l && l.id && l.qty > 0) : [];
    } catch { return []; }
  });

  useEffect(() => { storage("bb_cart", JSON.stringify(cart)); }, [cart]);

  // Drop lines whose dish was removed or sold out in the admin panel.
  useEffect(() => {
    setCart((c) => {
      const next = c.filter((l) => { const p = products.find((x) => x.id === l.id); return p && !p.hidden && !p.soldOut; });
      return next.length === c.length ? c : next;
    });
  }, [products]);

  const lineKey = (l) => `${l.id}|${l.spice || ""}|${l.extra ? 1 : 0}`;
  const add = useCallback((id, opts = {}, qty = 1) => {
    const line = { id, qty, spice: opts.spice || "", extra: Boolean(opts.extra) };
    setCart((c) => {
      const i = c.findIndex((l) => lineKey(l) === lineKey(line));
      if (i === -1) return [...c, line];
      const next = c.slice();
      next[i] = { ...next[i], qty: next[i].qty + qty };
      return next;
    });
  }, []);
  const change = useCallback((key, delta) => {
    setCart((c) => c.map((l) => (lineKey(l) === key ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0));
  }, []);
  const clear = useCallback(() => setCart([]), []);

  return { cart, add, change, clear, lineKey };
}

export function useCategoryList(products) {
  return useMemo(() => CATEGORIES.filter((c) => products.some((p) => !p.hidden && p.category === c.id)), [products]);
}
