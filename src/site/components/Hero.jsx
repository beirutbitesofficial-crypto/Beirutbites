import { useSite } from "../context.js";
import { dayHours, dayLabel, fmtMin, getStatus, isClosedToday } from "../../lib/hours.js";

export default function Hero() {
  const { t, settings } = useSite();
  const st = getStatus(settings);
  let state = "closed";
  let text;
  if (st.open) {
    const soon = st.minutesLeft <= 30;
    state = soon ? "soon" : "open";
    text = t(soon ? "statusClosingSoon" : "statusOpenUntil", { time: fmtMin(st.closesAt) });
  } else if (st.closedToday && settings.closedMessage) {
    text = settings.closedMessage;
  } else if (st.next) {
    const when = (st.next.offset === 0 ? "" : `${dayLabel(t, st.next.offset, st.next.dow)} `) + fmtMin(st.next.open);
    text = st.closedToday && st.next.offset > 0 ? t("statusClosedToday") : t("statusOpensAt", { when });
  } else {
    text = t("statusClosedToday");
  }
  const todayH = dayHours(settings, st.now.dow);
  const todayText = isClosedToday(settings, st.now) || !todayH ? t("closedLabel") : `${fmtMin(todayH.open)}–${fmtMin(todayH.close)}`;

  return (
    <section id="home" className="hero">
      <div className="hero-copy">
        <p className="status-pill" data-state={state}>
          <span className="status-dot" aria-hidden="true" />
          <span>{text}</span>
        </p>
        <h1>{t("heroTitle")}</h1>
        <p className="hero-lead">{t("heroDescription")}</p>
        <div className="hero-actions">
          <a className="btn btn-primary btn-lg" href="#menu">{t("heroOrder")}</a>
          <a className="btn btn-ghost btn-lg" href="#catering">{t("heroCatering")}</a>
        </div>
      </div>
      <div className="hero-visual">
        <figure className="hero-photo">
          <img src="images/kebab-tallrik.webp" alt="" width="480" height="720" fetchPriority="high" />
        </figure>
        <aside className="ticket" aria-labelledby="ticket-title">
          <h2 id="ticket-title">{t("statusTitle")}</h2>
          <dl>
            <div><dt>{t("statusHours")}</dt><dd id="today-hours">{todayText}</dd></div>
            <div><dt>{t("statusPrep")}</dt><dd><bdi>{settings.prepTime || "10–15"}</bdi> {t("minShort")}</dd></div>
            <div><dt>{t("statusPick")}</dt><dd>{t("statusPickValue")}</dd></div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
