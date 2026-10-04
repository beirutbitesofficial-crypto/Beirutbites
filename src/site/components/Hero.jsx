import { useSite } from "../context.js";
import { dayHours, dayLabel, fmtMin, getStatus, isClosedToday } from "../../lib/hours.js";

// Herb leaves scattered around the manakish: [variant, x%, y%, rotation, scale]
const HERBS = [["a", 14, 20, -28, 1], ["b", 74, 12, 34, .8], ["c", 86, 44, 62, 1.05], ["a", 8, 56, -70, .7], ["b", 30, 6, 12, .55], ["c", 62, 66, -40, .85], ["a", 90, 24, 110, .6]];
const STEAM = [[22, "0s"], [40, "1.6s"], [56, "3.1s"], [34, "4.4s"], [50, "5.4s"]];

function useStatusText() {
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
  const hours = isClosedToday(settings, st.now) || !todayH ? t("closedLabel") : `${fmtMin(todayH.open)}–${fmtMin(todayH.close)}`;
  return { state, text, hours };
}

export default function Hero() {
  const { t, settings } = useSite();
  const { state, text, hours } = useStatusText();
  const meta = t("meta");
  return (
    <section id="home" className="hero" data-hero>
      <div className="hero__glow" data-glow />
      <div className="hero__aura" data-aura />
      <div className="container hero__grid">
        <div className="hero__copy" data-hero-copy>
          <p className="status" data-state={state} data-cine><i aria-hidden="true" />{text}</p>
          <h1 className="hero__title" data-hero-title>
            {t("heroLines").map((line, i) => (
              <span className="tline" key={`${i}-${line}`}><span className="tline__in" dangerouslySetInnerHTML={{ __html: line }} /></span>
            ))}
          </h1>
          <p className="hero__lede" data-cine>{t("heroDescription")}</p>
          <div className="hero__actions" data-cine>
            <a href="#menu" className="btn btn--gold">{t("heroOrder")}</a>
            <a href="#catering" className="btn btn--line-light">{t("heroCatering")}</a>
          </div>
        </div>

        <div className="hero__visual" data-hero-visual>
          <div className="stage" data-stage aria-hidden="true">
            <div className="stage__arch" data-arch>
              <img className="stage__backdrop" src="images/kebab-tallrik.webp" alt="" decoding="async" />
              <span className="stage__floor" />
            </div>
            <div className="dish dish--side dish--left" data-side="left"><div className="dish__float"><img src="images/hero/ost-disc.webp" alt="" width="460" height="280" decoding="async" /></div></div>
            <div className="dish dish--side dish--right" data-side="right"><div className="dish__float"><img src="images/hero/muhammara-disc.webp" alt="" width="460" height="280" decoding="async" /></div></div>
            <canvas className="stage__sparks stage__sparks--back" data-sparks="back" />
            <div className="dish dish--hero" data-dish><div className="dish__float"><img src="images/hero/zaatar-disc.webp" alt="" width="456" height="284" fetchPriority="high" decoding="async" /></div></div>
            <div className="stage__steam" data-steam>
              {STEAM.map(([x, d], i) => <span key={i} className="steam" style={{ "--x": `${x}%`, "--d": d }} />)}
            </div>
            <canvas className="stage__sparks stage__sparks--front" data-sparks="front" />
            <div className="stage__herbs" data-herbs>
              {HERBS.map(([v, x, y, r, s], i) => (
                <svg key={i} className="herb" viewBox="0 0 60 90" data-herb={i} style={{ "--x": `${x}%`, "--y": `${y}%`, "--r": `${r}deg`, "--s": s }}>
                  <use href={`#bb-leaf-${v}`} />
                </svg>
              ))}
            </div>
          </div>
          <div className="ticket" data-cine data-ticket>
            <span>{t("ticketToday")}</span>
            <strong>{hours}</strong>
            <em>{t("statusPrep")} {settings.prepTime || "10–15"} {t("minShort")}</em>
          </div>
        </div>
      </div>
      <div className="container hero__meta" data-hero-meta>
        {meta.map((m, i) => <div key={m} data-cine><b>{["I", "II", "III"][i]}</b><span>{m}</span></div>)}
      </div>

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="bb-lg-a" cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="#bfe3a4" /><stop offset=".55" stopColor="#4f9a4a" /><stop offset="1" stopColor="#1d4a22" /></radialGradient>
          <radialGradient id="bb-lg-b" cx="40%" cy="25%" r="85%"><stop offset="0" stopColor="#d6efb9" /><stop offset=".6" stopColor="#6fae55" /><stop offset="1" stopColor="#2a5a26" /></radialGradient>
          <radialGradient id="bb-lg-c" cx="45%" cy="30%" r="80%"><stop offset="0" stopColor="#a9d58c" /><stop offset=".6" stopColor="#3d7f3a" /><stop offset="1" stopColor="#163a19" /></radialGradient>
          <symbol id="bb-leaf-a" viewBox="0 0 60 90"><path fill="url(#bb-lg-a)" d="M30 88C10 70 2 46 6 28 10 10 22 2 32 2c12 0 24 10 24 28 0 22-10 42-26 58z" /><path fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.2" d="M30 84C26 60 26 36 33 8M29 60l-12-10M30 44l13-10M31 30l-10-9" /></symbol>
          <symbol id="bb-leaf-b" viewBox="0 0 60 90"><path fill="url(#bb-lg-b)" d="M28 88C12 72 4 52 8 32 12 14 24 4 36 6c12 2 20 16 18 32-3 22-12 36-26 50z" /><path fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.2" d="M28 84c0-26 4-50 10-74M29 58l12-10M31 40 20 30" /></symbol>
          <symbol id="bb-leaf-c" viewBox="0 0 60 90"><path fill="url(#bb-lg-c)" d="M31 88C14 74 6 54 9 34 12 16 22 6 31 4c11-1 21 9 22 26 1 24-8 42-22 58z" /><path fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1.2" d="M31 84c-3-24-2-48 2-76M31 56l11-9M31 38 20 28" /></symbol>
        </defs>
      </svg>
    </section>
  );
}
