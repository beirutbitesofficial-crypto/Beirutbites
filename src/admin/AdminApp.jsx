import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, sendEmailVerification, getRedirectResult, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { collection, doc, getDoc, limit, onSnapshot, orderBy, query, setDoc, where } from "firebase/firestore";
import { auth, db, firebaseReady } from "../firebase.js";
import { ADMIN_EMAILS } from "../config.js";
import { normalizeSettings } from "../data/menu.js";
import { clone, fill, storage } from "../lib/utils.js";
import { T } from "./i18n.js";
import { AdminContext } from "./context.js";
import Gate from "./views/Gate.jsx";
import Today from "./views/Today.jsx";
import Orders from "./views/Orders.jsx";
import MenuView from "./views/MenuView.jsx";
import Offers from "./views/Offers.jsx";
import Hours from "./views/Hours.jsx";
import Settings from "./views/Settings.jsx";
import { NAV_ICONS } from "./icons.jsx";

const VIEWS = ["today", "orders", "menu", "offers", "hours", "settings"];
const NAV_KEYS = { today: "navToday", orders: "navOrders", menu: "navMenu", offers: "navOffers", hours: "navHours", settings: "navSettings" };
const ADMINS = ADMIN_EMAILS.map((e) => e.toLowerCase());

// Strip old settings.json fields before saving.
function cleanSettings(s) {
  const out = clone(s);
  ["prices", "images", "specialEnabled", "specialTitle", "specialText", "updatedAt", "updatedBy"].forEach((k) => delete out[k]);
  return out;
}

export default function AdminApp() {
  const [lang, setLangState] = useState(() => storage("bb_admin_lang") || "sv");
  const [gate, setGate] = useState(firebaseReady ? "loading" : "error");
  const [gateMsg, setGateMsg] = useState("");
  const [adminUser, setAdminUser] = useState(null);
  const [view, setView] = useState(() => {
    const v = location.hash.slice(1);
    return VIEWS.includes(v) ? v : "today";
  });
  const [draft, setDraftState] = useState(null);
  const [savedJSON, setSavedJSON] = useState("");
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [ordersError, setOrdersError] = useState("");
  const [toast, setToast] = useState({ msg: "", error: false, show: false });
  const authErrorRef = useRef(() => {});
  const toastTimer = useRef(null);

  const t = useCallback((key, vars) => {
    const dict = T[lang] || T.sv;
    return fill(dict[key] != null ? dict[key] : T.sv[key] != null ? T.sv[key] : key, vars);
  }, [lang]);
  const setLang = (l) => { const v = T[l] ? l : "sv"; setLangState(v); storage("bb_admin_lang", v); };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const showToast = useCallback((msg, error = false) => {
    setToast({ msg, error, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((x) => ({ ...x, show: false })), error ? 6000 : 2600);
  }, []);

  /* Auth gate */
  useEffect(() => {
    if (!firebaseReady) { setGateMsg("noFirebase"); return undefined; }
    getRedirectResult(auth).catch((e) => authErrorRef.current(e));
    // Never leave the login screen empty if Firebase is slow to answer.
    const fallback = setTimeout(() => setGate((g) => (g === "loading" ? "login" : g)), 6000);
    return onAuthStateChanged(auth, (u) => {
      clearTimeout(fallback);
      if (!u) { setAdminUser(null); setGate("login"); setGateMsg(""); return; }
      if (!ADMINS.includes(String(u.email || "").toLowerCase())) {
        setAdminUser(null); setGate("denied"); setGateMsg(fill(T[lang]?.notAdmin || T.sv.notAdmin, { email: u.email || u.uid }));
        return;
      }
      if (!u.emailVerified) { setAdminUser(null); setGate("verify"); setGateMsg(""); return; }
      setAdminUser(u); setGate("ok"); setGateMsg("");
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Load settings once logged in */
  useEffect(() => {
    if (gate !== "ok") return;
    getDoc(doc(db, "config", "site")).then(async (snap) => {
      if (snap.exists()) {
        const d = cleanSettings(normalizeSettings(snap.data()));
        setDraftState(d);
        setSavedJSON(JSON.stringify(d));
      } else {
        // First time: start from settings.json on the server, old browser-saved settings, or the defaults.
        let fileSettings = null;
        try { const r = await fetch("settings.json", { cache: "no-store" }); if (r.ok) fileSettings = await r.json(); } catch { /* none */ }
        let legacy = null;
        try { legacy = JSON.parse(storage("bb_admin") || "null"); } catch { /* none */ }
        setDraftState(cleanSettings(normalizeSettings(fileSettings || legacy || null)));
        setSavedJSON("");
        showToast(t("firstRun"));
      }
    }).catch((err) => {
      console.warn(err);
      setDraftState(cleanSettings(normalizeSettings(null)));
      showToast(t("saveFailed", { hint: t("permissionHint") }), true);
    });
  }, [gate]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Live orders and reward requests */
  useEffect(() => {
    if (gate !== "ok") return undefined;
    setOrdersError("");
    const u1 = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100)), (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ ...d.data(), _id: d.id }));
      setOrders(list);
    }, (err) => { console.warn(err); setOrdersError("ordersPermission"); });
    const u2 = onSnapshot(query(collection(db, "rewards"), where("status", "==", "pending")), (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ ...d.data(), _id: d.id }));
      setRewards(list);
    }, () => {});
    return () => { u1(); u2(); };
  }, [gate]);

  const dirty = Boolean(draft) && JSON.stringify(draft) !== savedJSON;
  useEffect(() => {
    const onUnload = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [dirty]);

  const pendingCount = useMemo(() => orders.filter((o) => o.status === "pending").length, [orders]);
  useEffect(() => {
    const c = pendingCount + rewards.length;
    document.title = `${c ? `(${c}) ` : ""}Admin · Beirut Bites`;
  }, [pendingCount, rewards.length]);

  const go = (v) => { setView(v); history.replaceState(null, "", `#${v}`); window.scrollTo(0, 0); };
  const update = useCallback((fn) => setDraftState((d) => { const n = clone(d); fn(n); return n; }), []);
  const replaceDraft = useCallback((d) => setDraftState(cleanSettings(d)), []);

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "config", "site"), { ...clone(draft), updatedAt: new Date().toISOString(), updatedBy: (auth.currentUser && auth.currentUser.email) || "" });
      setSavedJSON(JSON.stringify(draft));
      showToast(t("saved"));
    } catch (err) {
      console.warn(err);
      showToast(t("saveFailed", { hint: t("permissionHint") }), true);
    }
    setSaving(false);
  };
  const discard = () => setDraftState(savedJSON ? JSON.parse(savedJSON) : cleanSettings(normalizeSettings(null)));
  const logout = () => { if (dirty && !window.confirm(t("leaveWarning"))) return; signOut(auth); };

  // Turn Firebase error codes into a message that says what to fix.
  const authError = (e) => {
    const code = (e && e.code) || "";
    console.warn("Admin login error:", code, e);
    if (/unauthorized-domain/.test(code)) return setGateMsg(fill(T[lang]?.errDomain || T.sv.errDomain, { domain: location.hostname }));
    if (/operation-not-allowed/.test(code)) return setGateMsg("errProvider");
    if (/network-request-failed/.test(code)) return setGateMsg("errNetwork");
    if (/invalid-credential|wrong-password|user-not-found|invalid-email/.test(code)) return setGateMsg("loginFailed");
    return setGateMsg(`${T[lang]?.loginFailed || T.sv.loginFailed} (${code || "unknown"})`);
  };
  const loginGoogle = () => {
    setGateMsg("");
    const p = new GoogleAuthProvider();
    p.setCustomParameters({ prompt: "select_account" });
    signInWithPopup(auth, p).catch((e) => {
      if (/popup-blocked|operation-not-supported/.test(e.code || "")) return signInWithRedirect(auth, p).catch(authError);
      if (!/popup-closed|cancelled-popup/.test(e.code || "")) authError(e);
      return null;
    });
  };
  const loginEmail = (email, password) => { setGateMsg(""); signInWithEmailAndPassword(auth, email, password).catch(authError); };
  authErrorRef.current = authError;
  const sendVerify = () => sendEmailVerification(auth.currentUser).then(() => setGateMsg("verifySent")).catch(authError);
  const checkVerified = () => auth.currentUser.reload().then(() => {
    if (auth.currentUser.emailVerified) { setAdminUser(auth.currentUser); setGate("ok"); setGateMsg(""); }
    else setGateMsg("verifyNotYet");
  });

  if (gate !== "ok") {
    return (
      <Gate t={t} lang={lang} setLang={setLang} state={gate}
        message={gateMsg ? (T.sv[gateMsg] ? t(gateMsg) : gateMsg) : ""}
        email={auth && auth.currentUser ? auth.currentUser.email : ""}
        onVerify={sendVerify} onVerified={checkVerified}
        onGoogle={loginGoogle} onEmail={loginEmail} onLogout={() => signOut(auth)} />
    );
  }

  const ctx = { t, lang, setLang, draft, update, replaceDraft, savedJSON, orders, rewards, ordersError, showToast, go, adminUser, logout, pendingCount };
  const ViewComp = { today: Today, orders: Orders, menu: MenuView, offers: Offers, hours: Hours, settings: Settings }[view];

  return (
    <AdminContext.Provider value={ctx}>
      <div className="app">
        <aside className="sidebar">
          <div className="side-brand">
            <img src="images/logo.webp" alt="" width="40" height="40" />
            <div><strong>Beirut Bites</strong><small>{t("admin")}</small></div>
          </div>
          <nav className="side-nav">
            {VIEWS.map((v) => {
              const Icon = NAV_ICONS[v];
              const count = v === "orders" ? pendingCount + rewards.length : 0;
              return (
                <button key={v} type="button" className={`nav-btn${view === v ? " active" : ""}`} onClick={() => go(v)}>
                  <Icon />
                  <span>{t(NAV_KEYS[v])}</span>
                  {count > 0 && <span className="count">{count}</span>}
                </button>
              );
            })}
          </nav>
          <div className="side-foot">
            <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="sv">Svenska</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
            <a href="./" target="_blank" rel="noopener noreferrer" className="side-link">{t("openSite")}</a>
            <small className="muted" id="who">{adminUser && adminUser.email}</small>
            <button className="side-link" type="button" onClick={logout}>{t("logout")}</button>
          </div>
        </aside>

        <main className="main">
          {draft ? <ViewComp /> : <p className="muted">{t("loadingSettings")}</p>}
        </main>

        {dirty && (
          <div className="savebar">
            <span>{t("unsaved")}</span>
            <div className="btn-row">
              <button className="btn btn-ghost btn-sm" type="button" onClick={discard}>{t("discard")}</button>
              <button className="btn btn-primary btn-sm" type="button" onClick={save} disabled={saving}>{saving ? t("saving") : t("save")}</button>
            </div>
          </div>
        )}
      </div>
      <div className={`toast${toast.error ? " error" : ""}${toast.show ? " show" : ""}`} role="status" aria-live="polite">{toast.msg}</div>
    </AdminContext.Provider>
  );
}
