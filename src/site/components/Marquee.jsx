import { useSite } from "../context.js";
import { useCategoryList } from "../hooks.js";

export default function Marquee({ onPick }) {
  const { t, loc, products } = useSite();
  const cats = useCategoryList(products);
  if (!cats.length) return null;
  return (
    <section className="marquee" aria-label={t("categoryTabsAria")}>
      <div className="marquee__track">
        {[0, 1].map((r) => (
          <div className="marquee__group" key={r} aria-hidden={r ? "true" : undefined}>
            {cats.map((c) => (
              <span key={c.id} style={{ display: "contents" }}>
                <a href="#menu" tabIndex={r ? -1 : undefined} onClick={() => onPick(c.id)}>{loc(c.name)}</a><i>✦</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
