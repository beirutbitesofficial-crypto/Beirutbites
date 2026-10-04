import { useSite } from "../context.js";
import { IconPlus } from "../icons.jsx";

export default function MenuCard({ product: p, index = 0 }) {
  const { t, loc, kr, openProduct, productOptions } = useSite();
  const name = loc(p.name);
  const desc = loc(p.description);
  const wide = /kott-ost|spenat/.test(p.image || "");
  const o = productOptions(p);
  const quickLabel = o.spice || o.extra ? t("chooseOptions") : t("addToBag");
  return (
    <article className={`card reveal${p.soldOut ? " is-sold" : ""}`} data-id={p.id} style={{ "--d": `${(index % 4) * 0.08}s` }}>
      <div className="card__media-wrap">
        <button type="button" className={`card__media${wide ? " is-wide" : ""}`} aria-label={name} disabled={p.soldOut} onClick={() => openProduct(p.id)}>
          {p.image && <img src={p.image} alt="" width="480" height="600" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />}
        </button>
        {p.soldOut ? <span className="card__tag card__tag--sold">{t("soldOut")}</span> : p.popular ? <span className="card__tag">{t("popular")}</span> : null}
        {!p.soldOut && (
          <>
            <div className="card__quick"><button type="button" onClick={() => openProduct(p.id)}>{quickLabel}</button></div>
            <button type="button" className="card__add add-btn" aria-label={t("addNamed", { name })} onClick={() => openProduct(p.id)}><IconPlus /></button>
          </>
        )}
      </div>
      <div className="card__body">
        <button type="button" className="card__name" onClick={() => openProduct(p.id)} disabled={p.soldOut}>{name}</button>
        {desc && <p className="card__desc">{desc}</p>}
        <p className="card__price price">{kr(p.price)}</p>
      </div>
    </article>
  );
}
