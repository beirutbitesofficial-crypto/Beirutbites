import { useMemo, useState } from "react";
import { CATEGORIES, resolveImage } from "../../data/menu.js";
import { useAdmin } from "../context.js";
import { IconPlus } from "../icons.jsx";
import ProductEditor from "./ProductEditor.jsx";

export default function MenuView() {
  const { t, lang, draft, update, savedJSON } = useAdmin();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [editing, setEditing] = useState(null); // product id or "new"

  const savedProducts = useMemo(() => {
    const map = {};
    try { (JSON.parse(savedJSON || "{}").products || []).forEach((p) => { map[p.id] = JSON.stringify(p); }); } catch { /* none */ }
    return map;
  }, [savedJSON]);

  const q = search.trim().toLowerCase();
  const catName = (c) => c.name[lang] || c.name.sv;
  const setPrice = (id, value) => {
    const v = parseInt(value, 10);
    update((d) => { const p = d.products.find((x) => x.id === id); p.price = Number.isNaN(v) || v < 0 ? 0 : v; });
  };
  const setSold = (id, on) => update((d) => { const p = d.products.find((x) => x.id === id); if (on) p.soldOut = true; else delete p.soldOut; });

  return (
    <section className="view">
      <header className="view-head">
        <h1>{t("navMenu")}</h1>
        <button className="btn btn-primary" type="button" onClick={() => setEditing("new")}><IconPlus /><span>{t("addProduct")}</span></button>
      </header>
      <div className="toolbar">
        <input type="search" placeholder={t("searchPh")} value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">{t("allCategories")}</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{catName(c)}</option>)}
        </select>
      </div>
      <div className="product-list">
        {CATEGORIES.filter((c) => !cat || cat === c.id).map((c) => {
          const items = draft.products.filter((p) => p.category === c.id && (!q || [p.name.sv, p.name.en, p.name.ar].join(" ").toLowerCase().includes(q)));
          if (!items.length) return null;
          return (
            <div className="cat-block" key={c.id}>
              <h2>{catName(c)}</h2>
              <div className="cat-rows">
                {items.map((p) => {
                  const changed = savedJSON && savedProducts[p.id] !== JSON.stringify(p);
                  return (
                    <div key={p.id} className={`prow${p.hidden ? " is-hidden" : ""}${changed ? " is-changed" : ""}`}>
                      <img src={resolveImage(p.image) || "images/logo.webp"} alt="" loading="lazy" />
                      <button type="button" className="prow-name" onClick={() => setEditing(p.id)}>
                        <strong>{p.name.sv}</strong>
                        <small>
                          {p.name.en || ""}
                          {p.popular && <span className="flag">{t("popularShort")}</span>}
                          {p.hidden && <span className="flag red">{t("hidden")}</span>}
                        </small>
                      </button>
                      <label className="price-input">
                        <input type="number" min="0" step="1" inputMode="numeric" aria-label={t("price")} value={p.price} onChange={(e) => setPrice(p.id, e.target.value)} />
                        <span>kr</span>
                      </label>
                      <label className="soldout">
                        <span>{t("soldOutShort")}</span>
                        <span className="switch">
                          <input type="checkbox" checked={Boolean(p.soldOut)} onChange={(e) => setSold(p.id, e.target.checked)} />
                          <span className="slider" />
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {editing && <ProductEditor id={editing === "new" ? null : editing} defaultCategory={cat || CATEGORIES[0].id} onClose={() => setEditing(null)} />}
    </section>
  );
}
