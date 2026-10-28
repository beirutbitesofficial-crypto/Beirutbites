import { useEffect, useMemo, useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSite } from "../context.js";
import { db } from "../../firebase.js";
import { WHATSAPP_NUMBER } from "../../config.js";
import { storage } from "../../lib/utils.js";
import { IconClose } from "../icons.jsx";

function orderCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

// Order form for a category deal (e.g. 50 pastries for 350 kr): the customer picks how many
// of each dish, adds a message and sends it all on WhatsApp with name, phone and address.
export default function OfferSheet({ onClose }) {
  const { t, loc, kr, products, activeDeal, customer, firebaseReady, showToast, lang } = useSite();
  const saved = useMemo(() => { try { return JSON.parse(storage("bb_customer") || "null") || {}; } catch { return {}; } }, []);
  const [counts, setCounts] = useState({});
  const [name, setName] = useState(saved.name || (customer.user && customer.user.name) || "");
  const [phone, setPhone] = useState(saved.phone || "");
  const [address, setAddress] = useState(saved.address || "");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const closeRef = useRef(null);
  useEffect(() => { closeRef.current && closeRef.current.focus(); }, []);
  if (!activeDeal) return null;

  const { qty: size, price } = activeDeal;
  const items = products.filter((p) => activeDeal.matches(p) && !p.hidden && !p.soldOut);
  const total = items.reduce((s, p) => s + (counts[p.id] || 0), 0);
  const sets = Math.floor(total / size);
  const complete = total > 0 && total % size === 0;
  const left = total < size ? size - total : (size - (total % size)) % size;
  const setCount = (id, n) => { setError(""); setCounts((c) => ({ ...c, [id]: Math.max(0, Math.min(999, n)) })); };

  const send = (e) => {
    e.preventDefault();
    setError("");
    if (!complete) { setError(total < size ? t("offerNeedMore", { left }) : t("offerMultiple", { qty: size, next: size * 2 })); return; }
    if (!name.trim() || !phone.trim() || !address.trim()) { setError(t("offerRequired")); return; }

    const code = orderCode();
    const chosen = items.filter((p) => counts[p.id] > 0).map((p) => ({ id: p.id, name: p.name.sv || loc(p.name), qty: counts[p.id], unitPrice: Number(p.price) }));
    const subtotal = chosen.reduce((s, it) => s + it.unitPrice * it.qty, 0);
    const amount = sets * price;
    const lines = [
      t("offerWaGreeting", { code }),
      t("offerWaDeal", { qty: total, price: amount }),
      "",
      ...chosen.map((it) => `• ${it.qty}× ${it.name}`),
      "",
      `${t("waTotal")}: ${kr(amount)}`,
      `${t("waName")}: ${name.trim()}`,
      `${t("waPhone")}: ${phone.trim()}`,
      `${t("waAddress")}: ${address.trim()}`
    ];
    if (note.trim()) lines.push(`${t("waNote")}: ${note.trim()}`);
    storage("bb_customer", JSON.stringify({ ...saved, name: name.trim(), phone: phone.trim(), address: address.trim() }));

    // Open WhatsApp synchronously so phones don't block the new window.
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
    const win = window.open(url, "_blank");

    const user = customer.user;
    if (firebaseReady && user) {
      addDoc(collection(db, "orders"), {
        code, name: name.trim(), phone: phone.trim(), address: address.trim(), note: note.trim(), pickup: "",
        items: chosen.map((it) => ({ ...it, spice: "", extra: false, toppings: [] })),
        subtotal, discount: Math.max(0, subtotal - amount), total: amount, lang,
        uid: user.uid, email: user.email || "", points: Math.floor(amount), status: "pending", createdAt: serverTimestamp()
      }).then(() => customer.refresh(user.uid)).catch((err) => console.warn("Order not saved:", err));
    }

    onClose();
    showToast(t("orderSent"));
    if (!win) window.location.href = url;
  };

  return (
    <div className="modal">
      <div className="panel-scrim" onClick={onClose} />
      <form className="sheet offer" role="dialog" aria-modal="true" aria-labelledby="offer-title" onSubmit={send} noValidate>
        <button ref={closeRef} className="close-btn sheet__close" type="button" aria-label={t("close")} onClick={onClose}><IconClose /></button>
        <div className="sheet__body">
          <h2 id="offer-title">{t("offerTitle", { qty: size, name: loc(activeDeal.name), price })}</h2>
          <p className="sheet__desc">{t("offerPick", { qty: size })}</p>

          <ul className="offer__items">
            {items.map((p) => {
              const n = counts[p.id] || 0;
              return (
                <li key={p.id}>
                  {p.image && <img src={p.image} alt="" loading="lazy" />}
                  <span className="offer__name">{loc(p.name)}</span>
                  <div className="qty">
                    <button type="button" aria-label={`${t("decreaseQty")}: ${loc(p.name)}`} onClick={() => setCount(p.id, n - 1)}>−</button>
                    <input type="number" inputMode="numeric" min="0" aria-label={loc(p.name)} value={n || ""} placeholder="0"
                      onChange={(e) => setCount(p.id, parseInt(e.target.value, 10) || 0)} />
                    <button type="button" aria-label={`${t("increaseQty")}: ${loc(p.name)}`} onClick={() => setCount(p.id, n + 1)}>+</button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className={`offer__count${complete ? " is-done" : ""}`} aria-live="polite">
            <span>{t("offerCount", { n: total, qty: complete ? total : (sets + 1) * size })}</span>
            <strong>{complete ? kr(sets * price) : t("offerNeedMore", { left })}</strong>
          </div>

          <label className="field"><span>{t("nameLabel")}</span>
            <input type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field"><span>{t("offerPhone")}</span>
            <input type="tel" autoComplete="tel" inputMode="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="field"><span>{t("offerAddress")}</span>
            <input type="text" autoComplete="street-address" required value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <label className="field"><span>{t("offerMessage")}</span>
            <textarea rows="3" placeholder={t("offerMessageHint")} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn--dark btn--split">
            <span>{t("offerSend")}</span><strong>{kr(Math.max(1, sets) * price)}</strong>
          </button>
        </div>
      </form>
    </div>
  );
}
