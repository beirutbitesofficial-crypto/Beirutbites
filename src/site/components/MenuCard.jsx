import { useSite } from "../context.js";
import { IconPlus } from "../icons.jsx";

export default function MenuCard({ product: p }) {
  const { t, loc, kr, openProduct } = useSite();
  const name = loc(p.name);
  const desc = loc(p.description);
  const landscape = /kott-ost|spenat/.test(p.image || "");
  return (
    <article className={`menu-card${p.soldOut ? " is-sold" : ""}`} data-id={p.id}>
      <button className="menu-card-hit" type="button" aria-label={name} disabled={p.soldOut} onClick={() => openProduct(p.id)} />
      <div className={`menu-card-media${landscape ? " landscape" : ""}`}>
        {p.soldOut ? <span className="tag sold">{t("soldOut")}</span> : p.popular ? <span className="tag">{t("popular")}</span> : null}
        {p.image && (
          <img src={p.image} alt="" loading="lazy" decoding="async" width="480" height="720"
            onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
        )}
      </div>
      <div className="menu-card-body">
        <h4>{name}</h4>
        {desc && <p>{desc}</p>}
        <div className="menu-card-foot">
          <span className="price">{kr(p.price)}</span>
          <button className="add-btn" type="button" aria-label={t("addNamed", { name })} disabled={p.soldOut} onClick={() => openProduct(p.id)}>
            <IconPlus />
          </button>
        </div>
      </div>
    </article>
  );
}
