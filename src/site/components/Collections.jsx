import { useSite } from "../context.js";
import Words from "./Words.jsx";

const CATS = [
  { key: "catManakish", ids: ["manakish"], pick: "manakish", img: "images/zaatar.webp", pos: "center 42%", num: "I" },
  { key: "catWraps", ids: ["chicken", "kebab"], pick: "kebab", img: "images/kebab-rulle.webp", pos: "center 45%", num: "II" },
  { key: "catPizza", ids: ["pizza", "burger"], pick: "pizza", img: "images/kebab-pizza.webp", pos: "center 40%", num: "III" }
];

export default function Collections({ onPick }) {
  const { t, products } = useSite();
  const go = (id) => { onPick(id); document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" }); };
  return (
    <section className="section" id="collections">
      <div className="container">
        <div className="section-head" data-head>
          <div>
            <p className="eyebrow reveal"><span />{t("catsEyebrow")}</p>
            <h2 className="display reveal-words"><Words text={t("catsTitle")} /></h2>
          </div>
          <a href="#menu" className="link-arrow reveal" onClick={() => onPick("all")}>{t("catsLink")}</a>
        </div>
        <div className="cats">
          {CATS.map((c, i) => {
            const count = products.filter((p) => !p.hidden && c.ids.includes(p.category)).length;
            return (
              <button type="button" key={c.key} className="cat" style={{ "--d": `${i * 0.15}s` }} onClick={() => go(c.pick)}>
                <div className="cat__media" data-parallax style={{ backgroundImage: `url('${c.img}')`, backgroundPosition: c.pos }} />
                <div className="cat__veil" />
                <span className="cat__num">{c.num}</span>
                <div className="cat__body">
                  <span className="cat__count">{t("itemsCount", { n: count })}</span>
                  <h3>{t(c.key)}</h3>
                  <span className="cat__cta">{t("catsCta")}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
