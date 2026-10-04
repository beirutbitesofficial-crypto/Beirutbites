import { useEffect, useRef, useState } from "react";
import { useSite } from "../context.js";
import { CATEGORIES } from "../../data/menu.js";
import { useCategoryList } from "../hooks.js";
import { IconSearch } from "../icons.jsx";
import MenuCard from "./MenuCard.jsx";

export default function Menu() {
  const { t, loc, products } = useSite();
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");
  const [stuck, setStuck] = useState(false);
  const toolbarRef = useRef(null);
  const gridRef = useRef(null);
  const chipsRef = useRef(null);
  const cats = useCategoryList(products);

  useEffect(() => {
    const onScroll = () => {
      const tb = toolbarRef.current;
      const topbar = document.getElementById("topbar");
      if (tb && topbar) setStuck(tb.getBoundingClientRect().top <= topbar.offsetHeight + 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pick = (id) => {
    setActive(id);
    requestAnimationFrame(() => {
      const grid = gridRef.current, tb = toolbarRef.current, topbar = document.getElementById("topbar");
      if (grid && tb && topbar) {
        const top = grid.getBoundingClientRect().top + window.scrollY - tb.offsetHeight - topbar.offsetHeight - 8;
        if (window.scrollY > top) window.scrollTo({ top, behavior: "smooth" });
      }
      const chip = chipsRef.current && chipsRef.current.querySelector(".chip.active");
      if (chip) chip.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    });
  };

  const q = search.trim().toLowerCase();
  const visible = products.filter((p) => !p.hidden);
  const sections = CATEGORIES
    .filter((c) => active === "all" || active === c.id)
    .map((c) => ({
      cat: c,
      items: visible.filter((p) => {
        if (p.category !== c.id) return false;
        if (!q) return true;
        return [p.name.sv, p.name.en, p.name.ar, loc(p.description)].join(" ").toLowerCase().includes(q);
      })
    }))
    .filter((s) => s.items.length);
  const known = CATEGORIES.map((c) => c.id);
  const others = active === "all" && !q ? visible.filter((p) => !known.includes(p.category)) : [];

  return (
    <section id="menu" className="menu-section" aria-labelledby="menu-title">
      <div className="section-head">
        <h2 id="menu-title">{t("menuTitle")}</h2>
        <p>{t("menuDescription")}</p>
      </div>

      <div className={`menu-toolbar${stuck ? " stuck" : ""}`} ref={toolbarRef}>
        <label className="search">
          <IconSearch />
          <span className="sr-only">{t("searchLabel")}</span>
          <input type="search" placeholder={t("searchPlaceholder")} autoComplete="off" value={search}
            onChange={(e) => { setSearch(e.target.value); if (e.target.value && active !== "all") setActive("all"); }} />
        </label>
        <div className="chips" role="tablist" aria-label={t("categoryTabsAria")} ref={chipsRef}>
          <button className={`chip${active === "all" ? " active" : ""}`} role="tab" type="button" aria-selected={active === "all"} onClick={() => pick("all")}>
            {t("allCategories")}
          </button>
          {cats.map((c) => (
            <button key={c.id} className={`chip${active === c.id ? " active" : ""}`} role="tab" type="button" aria-selected={active === c.id} onClick={() => pick(c.id)}>
              <span aria-hidden="true">{c.icon}</span>{loc(c.name)}
            </button>
          ))}
        </div>
      </div>

      <div className="menu-grid" ref={gridRef}>
        {sections.map(({ cat, items }) => (
          <section key={cat.id} className="menu-category" id={`cat-${cat.id}`} aria-labelledby={`cat-h-${cat.id}`}>
            <h3 id={`cat-h-${cat.id}`}>{loc(cat.name)} <small>{t("itemsCount", { n: items.length })}</small></h3>
            <div className="menu-category-grid">
              {items.map((p) => <MenuCard key={p.id} product={p} />)}
            </div>
          </section>
        ))}
        {others.length > 0 && (
          <section className="menu-category">
            <div className="menu-category-grid">{others.map((p) => <MenuCard key={p.id} product={p} />)}</div>
          </section>
        )}
      </div>
      {!sections.length && !others.length && <p className="menu-empty">{t("noResults")}</p>}
    </section>
  );
}
