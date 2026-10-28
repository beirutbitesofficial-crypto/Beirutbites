import { useSite } from "../context.js";

export default function SpecialBanner() {
  const { t, loc, settings, activeDeal, addToCart, openCart } = useSite();
  const sp = settings.special || {};
  const text = loc(sp.text);
  if (!sp.enabled || !text) return null;
  const onClick = () => {
    if (activeDeal && activeDeal.product) { addToCart(activeDeal.product.id, {}, activeDeal.qty); openCart(); }
    else (document.getElementById(activeDeal ? `cat-${activeDeal.category}` : "menu") || document.getElementById("menu"))?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section className="special">
      <div className="container special__inner">
        <span className="special__mark" aria-hidden="true">✦</span>
        <div className="special__copy">
          <span>{loc(sp.title) || t("specialEyebrow")}</span>
          <strong>{text}</strong>
        </div>
        <button className="btn btn--gold btn--sm" type="button" id="specials-cta" onClick={onClick}>{activeDeal && activeDeal.product ? t("specialsCta") : t("heroOrder")}</button>
      </div>
    </section>
  );
}
