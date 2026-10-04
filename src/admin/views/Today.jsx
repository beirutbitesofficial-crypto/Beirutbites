import { useAdmin } from "../context.js";
import { isClosedToday, nowInMalmo, toMin } from "../../lib/hours.js";

export default function Today() {
  const { t, draft, update, go, pendingCount } = useAdmin();
  const now = nowInMalmo();
  const closed = isClosedToday(draft, now);
  const h = draft.hours[now.dow];
  const o = h && !h.closed ? toMin(h.open) : null;
  const c = h && !h.closed ? toMin(h.close) : null;
  let summary;
  let open = false;
  if (closed) summary = t("statusClosedToday");
  else if (o == null || c == null) summary = t("statusNoHours");
  else if (now.minutes < o) summary = t("statusOpensLater", { time: h.open });
  else if (now.minutes < (c <= o ? c + 1440 : c)) { summary = t("statusOpenNow", { time: h.close }); open = true; }
  else summary = t("statusClosedNow");

  const visible = draft.products.filter((p) => !p.hidden);
  const soldCount = visible.filter((p) => p.soldOut).length;

  const toggleOpen = (checked) => update((d) => {
    if (checked) { d.truckOpen = true; delete d.closedDate; }
    else { d.truckOpen = false; d.closedDate = now.date; }
  });
  const toggleSold = (id) => update((d) => {
    const p = d.products.find((x) => x.id === id);
    if (p.soldOut) delete p.soldOut; else p.soldOut = true;
  });

  return (
    <section className="view">
      <header className="view-head">
        <h1>{t("navToday")}</h1>
        <p className="muted">{t("days")[now.dow]} {now.date}</p>
      </header>
      <div className="today-grid">
        <div className={`card status-card${open ? " is-open" : ""}${closed ? " is-closed" : ""}`}>
          <div className="status-row">
            <div>
              <h2>{t("truckToday")}</h2>
              <p className="status-summary">{summary}</p>
            </div>
            <label className="switch big">
              <input type="checkbox" checked={!closed} onChange={(e) => toggleOpen(e.target.checked)} />
              <span className="slider" aria-hidden="true" />
              <span className="sr-only">{t("truckOpenToggle")}</span>
            </label>
          </div>
          <p className="muted small">{t("truckHint")}</p>
          {closed && (
            <label className="field">
              <span>{t("closedMessage")}</span>
              <input type="text" maxLength={80} placeholder={t("closedMessagePh")} value={draft.closedMessage || ""}
                onChange={(e) => { const v = e.target.value; update((d) => { d.closedMessage = v; }); }} />
            </label>
          )}
        </div>
        <button type="button" className="card stat-card" onClick={() => go("orders")}>
          <span className="stat">{pendingCount}</span>
          <span>{t("statPending")}</span>
        </button>
        <button type="button" className="card stat-card" onClick={() => go("menu")}>
          <span className="stat">{soldCount}</span>
          <span>{t("statSoldOut")}</span>
        </button>
      </div>
      <div className="card">
        <div className="card-head">
          <h2>{t("quickSoldOut")}</h2>
          <p className="muted small">{t("quickSoldOutHint")}</p>
        </div>
        <div className="toggle-chips">
          {visible.map((p) => (
            <button key={p.id} type="button" aria-pressed={Boolean(p.soldOut)} onClick={() => toggleSold(p.id)}>{p.name.sv}</button>
          ))}
        </div>
      </div>
    </section>
  );
}
