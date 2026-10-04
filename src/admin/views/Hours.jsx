import { useAdmin } from "../context.js";

const ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function Hours() {
  const { t, draft, update } = useAdmin();
  const setTime = (dow, k) => (e) => { const v = e.target.value; update((d) => { d.hours[dow] = { ...d.hours[dow], [k]: v }; }); };
  const setClosed = (dow) => (e) => {
    const closed = e.target.checked;
    update((d) => {
      const h = { ...d.hours[dow] };
      if (closed) h.closed = true;
      else { delete h.closed; h.open = h.open || "10:30"; h.close = h.close || "20:30"; }
      d.hours[dow] = h;
    });
  };
  return (
    <section className="view">
      <header className="view-head"><h1>{t("navHours")}</h1></header>
      <div className="card">
        <div className="hours-editor">
          {ORDER.map((dow) => {
            const h = draft.hours[dow] || {};
            const closed = Boolean(h.closed) || !h.open;
            return (
              <div key={dow} className={`hrow${closed ? " closed" : ""}`}>
                <strong>{t("days")[dow]}</strong>
                <label className="field"><span>{t("opens")}</span><input type="time" value={h.open || ""} disabled={closed} onChange={setTime(dow, "open")} /></label>
                <label className="field"><span>{t("closes")}</span><input type="time" value={h.close || ""} disabled={closed} onChange={setTime(dow, "close")} /></label>
                <label className="check"><input type="checkbox" checked={closed} onChange={setClosed(dow)} /><span>{t("closed")}</span></label>
              </div>
            );
          })}
        </div>
      </div>
      <div className="card">
        <label className="field narrow"><span>{t("prepTime")}</span>
          <input type="text" placeholder="10–15" value={draft.prepTime || ""} onChange={(e) => { const v = e.target.value; update((d) => { d.prepTime = v; }); }} />
        </label>
      </div>
    </section>
  );
}
