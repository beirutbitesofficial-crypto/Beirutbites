import { useEffect, useState } from "react";
import { doc, getDoc, increment, runTransaction, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { TIMEZONE } from "../../config.js";
import { useAdmin } from "../context.js";

export default function Orders() {
  const { t, lang, orders, rewards, ordersError, showToast } = useAdmin();
  const [filter, setFilter] = useState("pending");
  const [busy, setBusy] = useState({});
  const [userPoints, setUserPoints] = useState({});

  useEffect(() => {
    rewards.forEach((r) => {
      if (userPoints[r.uid] !== undefined) return;
      getDoc(doc(db, "users", r.uid)).then((s) => {
        if (s.exists()) setUserPoints((x) => ({ ...x, [r.uid]: s.data().points || 0 }));
      }).catch(() => {});
    });
  }, [rewards]); // eslint-disable-line react-hooks/exhaustive-deps

  const fail = (err) => { console.warn(err); showToast(t("saveFailed", { hint: t("permissionHint") }), true); };
  const fmtTime = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString(lang === "ar" ? "ar" : lang === "en" ? "en-GB" : "sv-SE", { timeZone: TIMEZONE, weekday: "short", hour: "2-digit", minute: "2-digit" });
  };

  const confirmOrder = async (id) => {
    setBusy((b) => ({ ...b, [id]: true }));
    const ref = doc(db, "orders", id);
    let info = null;
    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) return;
        const o = snap.data();
        if (o.status !== "pending") return;
        info = { code: o.code, points: Number(o.points) || Math.floor(o.total || 0) };
        tx.update(ref, { status: "done", confirmedAt: serverTimestamp() });
        if (o.uid) tx.set(doc(db, "users", o.uid), { points: increment(info.points) }, { merge: true });
      });
      if (info) showToast(t("orderConfirmed", info));
    } catch (err) { fail(err); }
    setBusy((b) => ({ ...b, [id]: false }));
  };
  const cancelOrder = (o) => {
    if (!window.confirm(t("confirmCancel", { code: o.code || "" }))) return;
    updateDoc(doc(db, "orders", o._id), { status: "cancelled" }).catch(fail);
  };
  const resolveReward = async (id, approve) => {
    setBusy((b) => ({ ...b, [id]: true }));
    const ref = doc(db, "rewards", id);
    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) return;
        const r = snap.data();
        if (r.status !== "pending") return;
        tx.update(ref, { status: approve ? "done" : "cancelled", resolvedAt: serverTimestamp() });
        if (approve) tx.set(doc(db, "users", r.uid), { points: increment(-Number(r.points || 0)) }, { merge: true });
      });
      if (approve) showToast(t("rewardApproved"));
    } catch (err) { fail(err); }
    setBusy((b) => ({ ...b, [id]: false }));
  };

  const list = filter === "pending" ? orders.filter((o) => o.status === "pending") : orders;

  return (
    <section className="view">
      <header className="view-head">
        <h1>{t("navOrders")}</h1>
        <div className="seg" role="tablist">
          {["pending", "all"].map((f) => (
            <button key={f} type="button" className={`seg-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
              {t(f === "pending" ? "filterPending" : "filterAll")}
            </button>
          ))}
        </div>
      </header>
      <p className="muted small explainer">{t("ordersHint")}</p>

      <div className="list">
        {rewards.map((r) => (
          <article className="order reward" key={r._id}>
            <div className="order-top">
              <strong>{t("reward")} · {r.name || r.email}</strong>
              <span className="pill pending">{t("status_pending")}</span>
            </div>
            <p className="order-meta">{r.name || ""} {t("rewardRequest", { points: r.points, has: userPoints[r.uid] ?? "…" })}</p>
            <div className="btn-row">
              <button className="btn btn-ok btn-sm" type="button" disabled={busy[r._id]} onClick={() => resolveReward(r._id, true)}>{t("approve")}</button>
              <button className="btn btn-ghost btn-sm" type="button" disabled={busy[r._id]} onClick={() => resolveReward(r._id, false)}>{t("reject")}</button>
            </div>
          </article>
        ))}
      </div>

      <div className="list">
        {list.map((o) => {
          const status = o.status || "pending";
          return (
            <article className="order" key={o._id}>
              <div className="order-top">
                <strong>#{o.code || o._id.slice(0, 4)} · {o.name || ""}</strong>
                <span className={`pill ${status}`}>{t(`status_${status}`)}</span>
                <span className="total">{o.total} kr</span>
              </div>
              <ul>
                {(o.items || []).map((i, idx) => {
                  const extra = [i.spice ? t(`spice_${i.spice}`) : "", i.extra ? t("extraShort") : ""].filter(Boolean);
                  return <li key={idx}>{i.qty}× {i.name}{extra.length > 0 && <span className="muted"> ({extra.join(", ")})</span>}</li>;
                })}
              </ul>
              <div className="order-meta">
                <span>{fmtTime(o.createdAt)}</span>
                <span>{t("pickup")}: {o.pickup === "asap" ? t("asap") : o.pickup}</span>
                {o.phone && <a href={`tel:${o.phone.replace(/\s+/g, "")}`}>{t("call")} {o.phone}</a>}
                {o.email && <span>{o.email}</span>}
                {o.note && <span>{t("note")}: {o.note}</span>}
              </div>
              {status === "pending" && (
                <div className="btn-row">
                  <button className="btn btn-ok btn-sm" type="button" disabled={busy[o._id]} onClick={() => confirmOrder(o._id)}>
                    {t("confirmOrder", { points: o.points || Math.floor(o.total || 0) })}
                  </button>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => cancelOrder(o)}>{t("cancelOrder")}</button>
                </div>
              )}
            </article>
          );
        })}
      </div>
      {!list.length && !rewards.length && <p className="empty">{t("ordersEmpty")}</p>}
      {ordersError && <p className="msg error">{t(ordersError, { hint: t("permissionHint") })}</p>}
    </section>
  );
}
