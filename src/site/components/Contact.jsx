import { useSite } from "../context.js";
import { dayHours, fmtMin } from "../../lib/hours.js";
import { IconInstagram, IconMail, IconTikTok, IconWhatsApp } from "../icons.jsx";

const ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function Contact() {
  const { t, settings } = useSite();
  const today = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Stockholm", weekday: "short" }).format(new Date());
  const todayDow = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[today];
  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <div className="contact-info">
        <h2 id="contact-title">{t("contactTitle")}</h2>
        <table className="hours-table" aria-label={t("statusHours")}>
          <tbody>
            {ORDER.map((dow) => {
              const h = dayHours(settings, dow);
              return (
                <tr key={dow} className={dow === todayDow ? "today" : ""}>
                  <td>{t("days")[dow]}</td>
                  <td>{h ? `${fmtMin(h.open)}–${fmtMin(h.close)}` : t("closedLabel")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <ul className="contact-links">
          <li><a href="https://wa.me/46790499644" target="_blank" rel="noopener noreferrer"><IconWhatsApp /> +46 790 499 644</a></li>
          <li><a href="mailto:media@beirutbites.shop"><IconMail /> media@beirutbites.shop</a></li>
          <li><a href="https://www.instagram.com/beirutbites.46" target="_blank" rel="noopener noreferrer"><IconInstagram /> @beirutbites.46</a></li>
          <li><a href="https://www.tiktok.com/@beirut.bites.official" target="_blank" rel="noopener noreferrer"><IconTikTok /> @beirut.bites.official</a></li>
        </ul>
      </div>
      <div className="map-embed">
        <iframe
          title="Beirut Bites map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2255.5940852911453!2d13.02056489781258!3d55.574265836163036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4653a100289db691%3A0x61707fc2493001b0!2sBeirut%20bites!5e0!3m2!1sen!2slb!4v1774679547045!5m2!1sen!2slb"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <a className="btn btn-ghost btn-sm map-link" href="https://maps.google.com/?q=Beirut+bites+Malm%C3%B6" target="_blank" rel="noopener noreferrer">{t("openInMaps")}</a>
      </div>
    </section>
  );
}
