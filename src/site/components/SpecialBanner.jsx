import { useSite } from "../context.js";

export default function SpecialBanner() {
  const { t, loc, settings, activeDeal, addToCart, openCart } = useSite();
  const sp = settings.special || {};
  const text = loc(sp.text);
  if (!sp.enabled || !text) return null;

  const onClick = () => {
    if (activeDeal) { addToCart(activeDeal.product.id, {}, activeDeal.qty); openCart(); }
    else document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="special">
      <div className="special-inner">
        <span className="special-badge" aria-hidden="true">%</span>
        <div className="special-copy">
          <strong>{loc(sp.title)}</strong>
          <span>{text}</span>
        </div>
        <button className="btn btn-primary btn-sm" type="button" id="specials-cta" onClick={onClick}>
          {activeDeal ? t("specialsCta") : t("heroOrder")}
        </button>
      </div>
    </div>
  );
}
