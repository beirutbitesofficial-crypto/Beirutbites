import { useSite } from "../context.js";
import { CATEGORIES } from "../../data/menu.js";
import Words from "./Words.jsx";

export default function Story() {
  const { t, products, settings } = useSite();
  const dishes = products.filter((p) => !p.hidden).length;
  const cats = CATEGORIES.filter((c) => products.some((p) => !p.hidden && p.category === c.id)).length;
  const minutes = String(settings.prepTime || "10–15").split(/[^0-9]/).filter(Boolean).pop() || "15";
  return (
    <section className="story" id="about">
      <span className="story__mark" aria-hidden="true" data-story-mark>B</span>
      <div className="container story__grid">
        <div className="story__copy" data-head>
          <p className="eyebrow eyebrow--light reveal"><span />{t("storyEyebrow")}</p>
          <h2 className="display display--light reveal-words"><Words text={t("aboutTitle")} /></h2>
          <p className="reveal">{t("aboutDescription")}</p>
          <a href="#catering" className="btn btn--line-light reveal">{t("storyCta")}</a>
        </div>
        <div className="story__stats" data-stats>
          <div style={{ "--d": "0s" }}><strong data-count={dishes}>{dishes}</strong><span>{t("statDishes")}</span></div>
          <div style={{ "--d": ".12s" }}><strong data-count={cats}>{cats}</strong><span>{t("statCats")}</span></div>
          <div style={{ "--d": ".24s" }}><strong data-count={minutes}>{minutes}</strong><span>{t("statMinutes")}</span></div>
        </div>
      </div>
    </section>
  );
}
