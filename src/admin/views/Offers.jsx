import { useAdmin } from "../context.js";
import { CATEGORIES } from "../../data/menu.js";

const LANGS = [["sv", "Svenska"], ["en", "English"], ["ar", "العربية"]];

export default function Offers() {
  const { t, draft, update } = useAdmin();
  const sp = draft.special || { enabled: false, title: {}, text: {} };
  const deal = draft.deal || { enabled: false, productId: "", qty: 2, price: 0 };
  const dealProduct = draft.products.find((p) => p.id === deal.productId);
  const dealCat = deal.category && CATEGORIES.find((c) => c.id === deal.category);
  const catPrices = dealCat ? draft.products.filter((p) => p.category === dealCat.id && !p.hidden).map((p) => Number(p.price)) : [];
  const dealTarget = dealCat
    ? (catPrices.length ? { name: dealCat.name.sv, unit: Math.min(...catPrices) } : null)
    : dealProduct && { name: dealProduct.name.sv, unit: Number(dealProduct.price) };
  // The select holds "cat:<id>" for a whole category, otherwise a product id.
  const pickTarget = (v) => setDeal(v.startsWith("cat:") ? { category: v.slice(4), productId: "" } : { category: "", productId: v });
  const vegValue = (k) => (draft.vegPrice && draft.vegPrice[k] !== undefined ? draft.vegPrice[k] : 10);
  const setVeg = (k) => (e) => { const v = Math.max(0, parseInt(e.target.value, 10) || 0); update((d) => { d.vegPrice = { ...(d.vegPrice || {}), [k]: v }; }); };

  const setSpecial = (group, l) => (e) => {
    const v = e.target.value;
    update((d) => { d.special = d.special || { enabled: true, title: {}, text: {} }; d.special[group] = { ...(d.special[group] || {}), [l]: v }; });
  };
  const setDeal = (patch) => update((d) => { d.deal = { ...(d.deal || { enabled: false, productId: "", qty: 2, price: 0 }), ...patch }; });
  const num = (v, min) => Math.max(min, parseInt(v, 10) || min);

  return (
    <section className="view">
      <header className="view-head"><h1>{t("navOffers")}</h1></header>

      <div className="card">
        <div className="card-head row">
          <div>
            <h2>{t("bannerTitle")}</h2>
            <p className="muted small">{t("bannerHint")}</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={Boolean(sp.enabled)} onChange={(e) => { const on = e.target.checked; update((d) => { d.special = { ...(d.special || {}), enabled: on }; }); }} />
            <span className="slider" aria-hidden="true" /><span className="sr-only">{t("show")}</span>
          </label>
        </div>
        <div className="lang-fields">
          {LANGS.map(([l, label]) => (
            <div className="lang-col" key={l} dir={l === "ar" ? "rtl" : undefined}>
              <h3>{label}</h3>
              <label className="field"><span>{t("heading")}</span><input type="text" value={(sp.title && sp.title[l]) || ""} onChange={setSpecial("title", l)} /></label>
              <label className="field"><span>{t("text")}</span><input type="text" value={(sp.text && sp.text[l]) || ""} onChange={setSpecial("text", l)} /></label>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-head row">
          <div>
            <h2>{t("dealTitle")}</h2>
            <p className="muted small">{t("dealHint")}</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={Boolean(deal.enabled)} onChange={(e) => setDeal({ enabled: e.target.checked })} />
            <span className="slider" aria-hidden="true" /><span className="sr-only">{t("on")}</span>
          </label>
        </div>
        <div className="grid-3">
          <label className="field"><span>{t("product")}</span>
            <select value={deal.category ? `cat:${deal.category}` : deal.productId} onChange={(e) => pickTarget(e.target.value)}>
              <optgroup label={t("dealWholeCategory")}>
                {CATEGORIES.map((c) => <option key={c.id} value={`cat:${c.id}`}>{c.name.sv}</option>)}
              </optgroup>
              <optgroup label={t("dealOneDish")}>
                {draft.products.filter((p) => !p.hidden).map((p) => <option key={p.id} value={p.id}>{p.name.sv} ({p.price} kr)</option>)}
              </optgroup>
            </select>
          </label>
          <label className="field"><span>{t("dealQty")}</span><input type="number" min="2" step="1" inputMode="numeric" value={deal.qty} onChange={(e) => setDeal({ qty: num(e.target.value, 2) })} /></label>
          <label className="field"><span>{t("dealPrice")}</span><input type="number" min="0" step="1" inputMode="numeric" value={deal.price} onChange={(e) => setDeal({ price: num(e.target.value, 0) })} /></label>
        </div>
        {deal.enabled && dealTarget && (
          <p className="preview">{t("dealPreview", { qty: deal.qty, name: dealTarget.name, price: deal.price, normal: dealTarget.unit * deal.qty })}</p>
        )}
      </div>

      <div className="card">
        <div className="card-head"><h2>{t("extraTitle")}</h2></div>
        <label className="field narrow"><span>{t("extraPrice")}</span>
          <input type="number" min="0" step="1" inputMode="numeric" value={draft.extraPrice ?? 10} onChange={(e) => { const v = Math.max(0, parseInt(e.target.value, 10) || 0); update((d) => { d.extraPrice = v; }); }} />
        </label>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>{t("vegTitle")}</h2>
          <p className="muted small">{t("vegHint")}</p>
        </div>
        <div className="grid-3">
          <label className="field"><span>{t("vegManakish")}</span><input type="number" min="0" step="1" inputMode="numeric" value={vegValue("manakish")} onChange={setVeg("manakish")} /></label>
          <label className="field"><span>{t("vegPizza")}</span><input type="number" min="0" step="1" inputMode="numeric" value={vegValue("pizza")} onChange={setVeg("pizza")} /></label>
        </div>
      </div>
    </section>
  );
}
