import { useEffect, useState } from "react";
import { CATEGORIES, resolveImage, slugify } from "../../data/menu.js";
import { clone } from "../../lib/utils.js";
import { useAdmin } from "../context.js";
import { IconClose } from "../icons.jsx";
import ImagePicker from "./ImagePicker.jsx";

const LANGS = [["sv", "Svenska"], ["en", "English"], ["ar", "العربية"]];

export default function ProductEditor({ id, defaultCategory, onClose }) {
  const { t, lang, draft, update } = useAdmin();
  const isNew = !id;
  const [p, setP] = useState(() => (id ? clone(draft.products.find((x) => x.id === id)) : {
    id: "", category: defaultCategory, price: 0, image: "",
    name: { sv: "", en: "", ar: "" }, description: { sv: "", en: "", ar: "" }
  }));
  const [error, setError] = useState("");
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    document.body.classList.add("no-scroll");
    const onKey = (e) => { if (e.key === "Escape" && !picking) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.classList.remove("no-scroll"); document.removeEventListener("keydown", onKey); };
  }, [onClose, picking]);

  const setField = (group, l) => (e) => { const v = e.target.value; setP((x) => ({ ...x, [group]: { ...(x[group] || {}), [l]: v } })); };
  const setFlag = (k) => (e) => { const on = e.target.checked; setP((x) => { const n = { ...x }; if (on) n[k] = true; else delete n[k]; return n; }); };

  const submit = (e) => {
    e.preventDefault();
    const nameSv = (p.name.sv || "").trim();
    if (!nameSv) { setError(t("nameRequired")); return; }
    const out = {
      ...p,
      price: Math.max(0, parseInt(p.price, 10) || 0),
      name: { sv: nameSv, en: (p.name.en || "").trim() || nameSv, ar: (p.name.ar || "").trim() || nameSv },
      description: { sv: (p.description?.sv || "").trim(), en: (p.description?.en || "").trim(), ar: (p.description?.ar || "").trim() }
    };
    update((d) => {
      if (isNew) {
        out.id = `${slugify(nameSv)}-${Math.random().toString(36).slice(2, 6)}`;
        let idx = -1;
        d.products.forEach((x, i) => { if (x.category === out.category) idx = i; });
        d.products.splice(idx === -1 ? d.products.length : idx + 1, 0, out);
      } else {
        d.products[d.products.findIndex((x) => x.id === out.id)] = out;
      }
    });
    onClose();
  };

  const remove = () => {
    if (!window.confirm(t("confirmDelete", { name: p.name.sv }))) return;
    update((d) => {
      d.products = d.products.filter((x) => x.id !== p.id);
      if (d.deal && d.deal.productId === p.id) d.deal.enabled = false;
    });
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-backdrop" onClick={onClose} />
      <form className="sheet" role="dialog" aria-modal="true" aria-labelledby="editor-title" onSubmit={submit}>
        <div className="sheet-head">
          <h2 id="editor-title">{t(isNew ? "newProduct" : "editProduct")}</h2>
          <button className="icon-btn" type="button" aria-label={t("cancel")} onClick={onClose}><IconClose /></button>
        </div>
        <div className="sheet-body">
          <div className="editor-top">
            <button type="button" className="img-pick" onClick={() => setPicking(true)}>
              <img src={resolveImage(p.image) || "images/logo.webp"} alt="" />
              <span>{t("changeImage")}</span>
            </button>
            <div className="stack grow">
              <label className="field"><span>{t("category")}</span>
                <select value={p.category} onChange={(e) => { const v = e.target.value; setP((x) => ({ ...x, category: v })); }}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name[lang] || c.name.sv}</option>)}
                </select>
              </label>
              <label className="field"><span>{t("price")}</span>
                <input type="number" min="0" step="1" inputMode="numeric" required value={p.price} onChange={(e) => { const v = e.target.value; setP((x) => ({ ...x, price: v })); }} />
              </label>
            </div>
          </div>
          <div className="lang-fields">
            {LANGS.map(([l, label]) => (
              <div className="lang-col" key={l} dir={l === "ar" ? "rtl" : undefined}>
                <h3>{label}</h3>
                <label className="field"><span>{t("name")}</span><input type="text" required={l === "sv"} autoFocus={l === "sv"} value={p.name[l] || ""} onChange={setField("name", l)} /></label>
                <label className="field"><span>{t("description")}</span><textarea rows={2} value={(p.description && p.description[l]) || ""} onChange={setField("description", l)} /></label>
              </div>
            ))}
          </div>
          <div className="checks">
            <label className="check"><input type="checkbox" checked={Boolean(p.popular)} onChange={setFlag("popular")} /><span>{t("popular")}</span></label>
            <label className="check"><input type="checkbox" checked={Boolean(p.soldOut)} onChange={setFlag("soldOut")} /><span>{t("soldOut")}</span></label>
            <label className="check"><input type="checkbox" checked={Boolean(p.hidden)} onChange={setFlag("hidden")} /><span>{t("hiddenLabel")}</span></label>
          </div>
          {error && <p className="msg error">{error}</p>}
        </div>
        <div className="sheet-foot">
          {!isNew && <button type="button" className="btn btn-danger btn-sm" onClick={remove}>{t("delete")}</button>}
          <span className="grow" />
          <button type="button" className="btn btn-ghost" onClick={onClose}>{t("cancel")}</button>
          <button type="submit" className="btn btn-primary">{t("done")}</button>
        </div>
      </form>
      {picking && <ImagePicker value={p.image} onClose={() => setPicking(false)} onPick={(img) => { setP((x) => ({ ...x, image: img })); setPicking(false); }} />}
    </div>
  );
}
