import { useEffect, useMemo, useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSite } from "../context.js";
import { db } from "../../firebase.js";
import { REQUIRE_LOGIN_FOR_CHECKOUT, WHATSAPP_NUMBER } from "../../config.js";
import { dayLabel, fmtMin, getStatus, pickupSlots } from "../../lib/hours.js";
import { storage } from "../../lib/utils.js";
import { IconBag, IconClose } from "../icons.jsx";

function orderCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

export default function CartDrawer() {
  const site = useSite();
  const { t, loc, kr, cart, lineKey, changeQty, clearCart, totals, activeDeal, unitPrice, findProduct,
    settings, cartOpen, closeCart, customer, firebaseReady, openAuth, showToast, tick } = site;
  const saved = useMemo(() => { try { return JSON.parse(storage("bb_customer") || "null") || {}; } catch { return {}; } }, []);
  const [name, setName] = useState(saved.name || "");
  const [phone, setPhone] = useState(saved.phone || "");
  const [pickup, setPickup] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [nameInvalid, setNameInvalid] = useState(false);
  const closeRef = useRef(null);
  const nameRef = useRef(null);
  const user = customer.user;

  // Prefill the name from the account (and keep it in sync while it is still the auto-filled value).
  const autoName = useRef("");
  const userName = user ? user.name : "";
  useEffect(() => {
    if (!userName) return;
    const previous = autoName.current;
    autoName.current = userName;
    setName((current) => (!current || current === previous ? userName : current));
  }, [userName]);
  useEffect(() => { if (cartOpen) setTimeout(() => closeRef.current && closeRef.current.focus(), 50); }, [cartOpen]);

  const status = getStatus(settings);
  const slots = useMemo(() => pickupSlots(settings, status, t), [settings, t, tick, cartOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!slots.some((s) => s.value === pickup)) setPickup(slots[0] ? slots[0].value : "");
  }, [slots, pickup]);

  let closedNote = "";
  if (!status.open) {
    closedNote = status.next
      ? t(status.closedToday ? "closedTodayNote" : "closedPreorder", { when: `${dayLabel(t, status.next.offset, status.next.dow)} ${fmtMin(status.next.open)}` })
      : t("noSlots");
  }

  const buildMessage = (order) => {
    const lines = [t("waGreeting", { code: order.code }), ""];
    order.items.forEach((it) => {
      const extra = [];
      if (it.spice) extra.push(t(`spice_${it.spice}`));
      if (it.extra) extra.push(t("extraShort"));
      lines.push(`• ${it.qty}× ${it.name}${extra.length ? ` (${extra.join(", ")})` : ""} — ${kr(it.unitPrice * it.qty)}`);
    });
    lines.push("");
    if (order.discount > 0) lines.push(`${t("waDeal")}: −${kr(order.discount)}`);
    lines.push(`${t("waTotal")}: ${kr(order.total)}`);
    lines.push(`${t("waName")}: ${order.name}`);
    if (order.phone) lines.push(`${t("waPhone")}: ${order.phone}`);
    lines.push(`${t("waPickup")}: ${order.pickup === "asap" ? t("waAsap") : order.pickup}`);
    if (order.note) lines.push(`${t("waNote")}: ${order.note}`);
    return lines.join("\n");
  };

  const checkout = (e) => {
    e.preventDefault();
    setError("");
    if (!cart.length) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setNameInvalid(true);
      setError(t("nameRequired"));
      nameRef.current && nameRef.current.focus();
      return;
    }
    if (REQUIRE_LOGIN_FOR_CHECKOUT && firebaseReady && !user) {
      setError(t("loginRequired"));
      openAuth();
      return;
    }
    const order = {
      code: orderCode(),
      name: trimmed,
      phone: phone.trim(),
      pickup,
      note: note.trim(),
      items: cart.map((l) => {
        const p = findProduct(l.id);
        return { id: l.id, name: p ? p.name.sv || loc(p.name) : l.id, qty: l.qty, unitPrice: unitPrice(l), spice: l.spice || "", extra: Boolean(l.extra) };
      }),
      subtotal: totals.subtotal,
      discount: totals.discount,
      total: totals.total,
      lang: site.lang
    };
    storage("bb_customer", JSON.stringify({ name: order.name, phone: order.phone }));

    // Open WhatsApp synchronously so phones don't block the new window.
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(order))}`;
    const win = window.open(url, "_blank");

    if (firebaseReady && user) {
      addDoc(collection(db, "orders"), {
        ...order,
        uid: user.uid,
        email: user.email || "",
        points: Math.floor(order.total),
        status: "pending",
        createdAt: serverTimestamp()
      }).then(() => customer.refresh(user.uid)).catch((err) => console.warn("Order not saved:", err));
    }

    clearCart();
    setNote("");
    closeCart();
    showToast(t("orderSent"));
    if (!win) window.location.href = url;
  };

  return (
    <>
      {cartOpen && <div className="panel-scrim" onClick={closeCart} />}
      <aside className={`cart${cartOpen ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden={!cartOpen}>
        <div className="cart__head">
          <h2 id="cart-title">{t("cartTitle")}</h2>
          <button ref={closeRef} className="close-btn" type="button" aria-label={t("close")} onClick={closeCart}><IconClose /></button>
        </div>
        <div className="cart__body">
          <div className="cart-items">
            {!cart.length && (
              <div className="cart-empty">
                <IconBag width={44} height={44} strokeWidth={1} />
                <p>{t("emptyCart")}</p>
                <a className="btn btn--line btn--sm" href="#menu" onClick={closeCart}>{t("browseMenu")}</a>
              </div>
            )}
            {cart.map((l) => {
              const p = findProduct(l.id);
              if (!p) return null;
              const key = lineKey(l);
              const details = [l.spice ? t(`spice_${l.spice}`) : "", l.extra ? t("extraShort") : ""].filter(Boolean).join(", ");
              return (
                <div className="line" key={key}>
                  <img src={p.image} alt="" loading="lazy" />
                  <div>
                    <span className="line__name">{loc(p.name)}</span>
                    {details && <small className="line__meta">{details}</small>}
                    <span className="line__price">{kr(unitPrice(l) * l.qty)}</span>
                  </div>
                  <div className="qty">
                    <button type="button" aria-label={l.qty === 1 ? t("remove") : t("decreaseQty")} onClick={() => changeQty(key, -1)}>−</button>
                    <span>{l.qty}</span>
                    <button type="button" aria-label={t("increaseQty")} onClick={() => changeQty(key, 1)}>+</button>
                  </div>
                </div>
              );
            })}
          </div>

          {cart.length > 0 && (
            <form id="checkout-form" className="checkout" noValidate onSubmit={checkout}>
              <div className="totals">
                {totals.discount > 0 && activeDeal && (
                  <>
                    <div><span>{t("subtotal")}</span><span>{kr(totals.subtotal)}</span></div>
                    <div className="deal">
                      <span>{t("dealLine", { qty: activeDeal.qty, name: loc(activeDeal.product.name), price: activeDeal.price })}</span>
                      <span>−{kr(totals.discount)}</span>
                    </div>
                  </>
                )}
                <div className="grand"><span>{t("totalLabel")}</span><span>{kr(totals.total)}</span></div>
              </div>
              {closedNote && <p className="notice">{closedNote}</p>}
              <label className="field">
                <span>{t("nameLabel")}</span>
                <input ref={nameRef} id="customer-name" type="text" autoComplete="name" required value={name}
                  aria-invalid={nameInvalid || undefined} aria-describedby="checkout-error"
                  onChange={(e) => { setName(e.target.value); setNameInvalid(false); setError(""); }} />
              </label>
              {error && <p id="checkout-error" className="form-error" role="alert">{error}</p>}
              <label className="field">
                <span>{t("phoneLabel")}</span>
                <input type="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
              <label className="field">
                <span>{t("pickupLabel")}</span>
                <select value={pickup} disabled={!slots.length} onChange={(e) => setPickup(e.target.value)}>
                  {slots.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </label>
              <label className="field">
                <span>{t("noteLabel")}</span>
                <textarea rows={2} placeholder={t("notePlaceholder")} value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
              {firebaseReady && (
                <p className="loyalty">
                  {user ? t("earnPoints", { points: Math.floor(totals.total) }) : (
                    <>{t(REQUIRE_LOGIN_FOR_CHECKOUT ? "loginRequired" : "loginToCollect")} <button type="button" onClick={openAuth}>{t("loginNow")}</button></>
                  )}
                </p>
              )}
            </form>
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart__foot">
            <button id="checkout-whatsapp" className="btn btn--gold btn--block btn--split" type="submit" form="checkout-form" disabled={!slots.length}>
              <span>{t("checkout")}</span>
              <strong id="checkout-total">{kr(totals.total)}</strong>
            </button>
            {settings.stripePaymentLink && (
              <button className="btn btn--line btn--block" type="button" onClick={() => window.open(settings.stripePaymentLink, "_blank", "noopener")}>{t("payOnline")}</button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
