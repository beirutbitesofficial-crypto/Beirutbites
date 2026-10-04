import { useEffect, useRef, useState } from "react";
import { useSite } from "../context.js";
import { CATEGORIES } from "../../data/menu.js";
import { useCategoryList } from "../hooks.js";
import { IconSearch } from "../icons.jsx";
import MenuCard from "./MenuCard.jsx";
import Words from "./Words.jsx";

export default function Menu({ active, setActive }) {
  const { t, loc, products } = useSite();
  const [search, setSearch] = useState("");
  const [stuck, setStuck] = useState(false);
  const toolbarRef = useRef(null);
  const gridRef = useRef(null);
  const tabsRef = useRef(null);
  const cats = useCategoryList(products);

  useEffect(() => {
    const onScroll = () => {
      const tb = toolbarRef.current, topbar = document.getElementById("topbar");
      if (tb && topbar) setStuck(tb.getBoundingClientRect().top <= topbar.offsetHeight + 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const tab = tabsRef.current && tabsRef.current.querySelector(".tab.is-active");
    if (tab) tab.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [active]);

  const pick = (id) => {
    setActive(id);
    requestAnimationFrame(() => {
      const grid = gridRef.current, tb = toolbarRef.current, topbar = document.getElementById("topbar");
      if (grid && tb && topbar) {
        const top = grid.getBoundingClientRect().top + window.scrollY - tb.offsetHeight - topbar.offsetHeight - 8;
        if (window.scrollY > top) window.scrollTo({ top, behavior: "smooth" });
      }
    });
  };

  const q = search.trim().toLowerCase();
  const visible = products.filter((p) => !p.hidden);
  const sections = CATEGORIES
    .filter((c) => active === "all" || active === c.id)
    .map((c) => ({
      cat: c,
      items: visible.filter((p) => p.category === c.id && (!q || [p.name.sv, p.name.en, p.name.ar, loc(p.description)].join(" ").toLowerCase().includes(q)))
    }))
    .filter((s) => s.items.length);
  const known = CATEGORIES.map((c) => c.id);
  const others = active === "all" && !q ? visible.filter((p) => !known.includes(p.category)) : [];

  return (
    <section id="menu" className="section section--ivory" aria-labelledby="menu-title">
      <div className="container">
        <div className="section-head" data-head>
          <div>
            <p className="eyebrow reveal"><span />{t("menuEyebrow")}</p>
            <h2 id="menu-title" className="display reveal-words"><Words text={t("menuTitle")} /></h2>
          </div>
          <p className="lede reveal">{t("menuDescription")}</p>
        </div>

        <div className={`menu-toolbar${stuck ? " is-stuck" : ""}`} ref={toolbarRef}>
          <label className="search">
            <IconSearch />
            <span className="sr-only">{t("searchLabel")}</span>
            <input type="search" placeholder={t("searchPlaceholder")} autoComplete="off" value={search}
              onChange={(e) => { setSearch(e.target.value); if (e.target.value && active !== "all") setActive("all"); }} />
          </label>
          <div className="tabs" role="tablist" aria-label={t("categoryTabsAria")} ref={tabsRef}>
            <button className={`tab${active === "all" ? " is-active" : ""}`} role="tab" type="button" aria-selected={active === "all"} onClick={() => pick("all")}>{t("allCategories")}</button>
            {cats.map((c) => (
              <button key={c.id} className={`tab${active === c.id ? " is-active" : ""}`} role="tab" type="button" aria-selected={active === c.id} onClick={() => pick(c.id)}>{loc(c.name)}</button>
            ))}
          </div>
        </div>

        <div ref={gridRef}>
          {sections.map(({ cat, items }, i) => (
            <section key={cat.id} className="menu-cat" id={`cat-${cat.id}`} aria-labelledby={`cat-h-${cat.id}`}>
              <div className="menu-cat__head">
                <span aria-hidden="true">{["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][CATEGORIES.indexOf(cat)] || i + 1}</span>
                <h3 id={`cat-h-${cat.id}`}>{loc(cat.name)}</h3>
                <small>{t("itemsCount", { n: items.length })}</small>
              </div>
              <div className="grid-products">
                {items.map((p, j) => <MenuCard key={p.id} product={p} index={j} />)}
              </div>
            </section>
          ))}
          {others.length > 0 && (
            <section className="menu-cat"><div className="grid-products">{others.map((p, j) => <MenuCard key={p.id} product={p} index={j} />)}</div></section>
          )}
          {!sections.length && !others.length && <p className="menu-empty">{t("noResults")}</p>}
        </div>
      </div>
    </section>
  );
}
