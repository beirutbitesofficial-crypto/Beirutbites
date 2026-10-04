import { useEffect, useRef, useState } from "react";
import { useSite } from "../context.js";
import { IconClose } from "../icons.jsx";

const SPICES = ["mild", "medium", "hot"];

export default function ProductSheet({ id, onClose }) {
  const { t, loc, kr, findProduct, productOptions, extraPrice, addToCart } = useSite();
  const p = findProduct(id);
  const [spice, setSpice] = useState("mild");
  const [extra, setExtra] = useState(false);
  const [qty, setQty] = useState(1);
  const closeRef = useRef(null);
  useEffect(() => { closeRef.current && closeRef.current.focus(); }, []);
  if (!p) return null;
  const opts = productOptions(p);
  const unit = Number(p.price) + (extra ? extraPrice : 0);

  const confirm = () => {
    addToCart(p.id, { spice: opts.spice ? spice : "", extra: opts.extra && extra }, qty);
    onClose();
  };

  return (
    <div className="modal">
      <div className="panel-scrim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="pm-name">
        <button ref={closeRef} className="close-btn sheet__close" type="button" aria-label={t("close")} onClick={onClose}><IconClose /></button>
        {p.image && <img className="sheet__image" src={p.image} alt="" />}
        <div className="sheet__body">
          <h2 id="pm-name">{loc(p.name)}</h2>
          {loc(p.description) && <p className="sheet__desc">{loc(p.description)}</p>}
          {opts.spice && (
            <fieldset className="opt">
              <legend>{t("spiceLabel")}</legend>
              <div className="seg">
                {SPICES.map((k) => (
                  <label key={k}>
                    <input type="radio" name="pm-spice" value={k} checked={spice === k} onChange={() => setSpice(k)} />
                    <span>{t(`spice_${k}`)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {opts.extra && (
            <label className="check">
              <input type="checkbox" checked={extra} onChange={(e) => setExtra(e.target.checked)} />
              <span>{t("extraTopping", { price: extraPrice })}</span>
            </label>
          )}
          <div className="sheet__foot">
            <div className="qty" aria-label={t("quantity")}>
              <button type="button" aria-label={t("decreaseQty")} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <output>{qty}</output>
              <button type="button" aria-label={t("increaseQty")} onClick={() => setQty((q) => Math.min(50, q + 1))}>+</button>
            </div>
            <button type="button" id="pm-add" className="btn btn--dark btn--split" onClick={confirm}>
              <span>{t("add")}</span><strong>{kr(unit * qty)}</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
