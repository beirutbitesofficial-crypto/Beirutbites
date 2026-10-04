import { useAdmin } from "../context.js";

const LANGS = [["sv", "Svenska"], ["en", "English"], ["ar", "العربية"]];

export default function Offers() {
  const { t, draft, update } = useAdmin();
  const sp = draft.special || { enabled: false, title: {}, text: {} };
  const deal = draft.deal || { enabled: false, productId: "", qty: 2, price: 0 };
  const dealProduct = draft.products.find((p) => p.id === deal.productId);

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
            <select value={deal.productId} onChange={(e) => setDeal({ productId: e.target.value })}>
              {draft.products.filter((p) => !p.hidden).map((p) => <option key={p.id} value={p.id}>{p.name.sv} ({p.price} kr)</option>)}
            </select>
          </label>
          <label className="field"><span>{t("dealQty")}</span><input type="number" min="2" step="1" inputMode="numeric" value={deal.qty} onChange={(e) => setDeal({ qty: num(e.target.value, 2) })} /></label>
          <label className="field"><span>{t("dealPrice")}</span><input type="number" min="0" step="1" inputMode="numeric" value={deal.price} onChange={(e) => setDeal({ price: num(e.target.value, 0) })} /></label>
        </div>
        {deal.enabled && dealProduct && (
          <p className="preview">{t("dealPreview", { qty: deal.qty, name: dealProduct.name.sv, price: deal.price, normal: dealProduct.price * deal.qty })}</p>
        )}
      </div>

      <div className="card">
        <div className="card-head"><h2>{t("extraTitle")}</h2></div>
        <label className="field narrow"><span>{t("extraPrice")}</span>
          <input type="number" min="0" step="1" inputMode="numeric" value={draft.extraPrice ?? 10} onChange={(e) => { const v = Math.max(0, parseInt(e.target.value, 10) || 0); update((d) => { d.extraPrice = v; }); }} />
        </label>
      </div>
    </section>
  );
}
