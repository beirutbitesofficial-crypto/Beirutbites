import { useRef } from "react";
import { normalizeSettings } from "../../data/menu.js";
import { useAdmin } from "../context.js";

export default function Settings() {
  const { t, lang, setLang, draft, update, replaceDraft, showToast, adminUser, logout } = useAdmin();
  const fileRef = useRef(null);

  const exportFile = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "settings.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const importFile = (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { replaceDraft(normalizeSettings(JSON.parse(reader.result))); showToast(t("imported")); }
      catch { showToast(t("invalidFile"), true); }
    };
    reader.readAsText(f);
  };
  const reset = () => { if (window.confirm(t("confirmReset"))) replaceDraft(normalizeSettings(null)); };

  return (
    <section className="view">
      <header className="view-head"><h1>{t("navSettings")}</h1></header>

      <div className="card">
        <div className="card-head">
          <h2>{t("paymentTitle")}</h2>
          <p className="muted small">{t("paymentHint")}</p>
        </div>
        <label className="field"><span>{t("stripeLink")}</span>
          <input type="url" placeholder="https://buy.stripe.com/…" value={draft.stripePaymentLink || ""} onChange={(e) => { const v = e.target.value.trim(); update((d) => { d.stripePaymentLink = v; }); }} />
        </label>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>{t("backupTitle")}</h2>
          <p className="muted small">{t("backupHint")}</p>
        </div>
        <div className="btn-row">
          <button className="btn btn-ghost" type="button" onClick={exportFile}>{t("exportBtn")}</button>
          <button className="btn btn-ghost" type="button" onClick={() => fileRef.current.click()}>{t("importBtn")}</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importFile} />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>{t("accountTitle")}</h2>
          <p className="muted small">{adminUser && adminUser.email}</p>
        </div>
        <div className="btn-row">
          <select aria-label="Language" style={{ maxWidth: 200 }} value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="sv">Svenska</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
          <a className="btn btn-ghost" href="./" target="_blank" rel="noopener noreferrer">{t("openSite")}</a>
          <button className="btn btn-ghost" type="button" onClick={logout}>{t("logout")}</button>
        </div>
      </div>

      <div className="card danger">
        <div className="card-head">
          <h2>{t("resetTitle")}</h2>
          <p className="muted small">{t("resetHint")}</p>
        </div>
        <button className="btn btn-danger" type="button" onClick={reset}>{t("resetBtn")}</button>
      </div>
    </section>
  );
}
