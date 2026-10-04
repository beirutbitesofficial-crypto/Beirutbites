import { useState } from "react";
import { useSite } from "../context.js";
import { WHATSAPP_NUMBER } from "../../config.js";
import { nowInMalmo } from "../../lib/hours.js";
import Words from "./Words.jsx";

export default function Catering() {
  const { t } = useSite();
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!date || !guests) return;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t("cateringMessage", { date, guests }))}`;
    if (!window.open(url, "_blank")) window.location.href = url;
  };
  return (
    <section id="catering" className="section catering">
      <div className="container catering__grid">
        <div className="catering__copy" data-head>
          <p className="eyebrow eyebrow--light reveal"><span />{t("cateringEyebrow")}</p>
          <h2 className="display display--light reveal-words"><Words text={t("cateringTitle")} /></h2>
          <p className="reveal">{t("cateringDescription")}</p>
        </div>
        <form className="catering__form reveal" onSubmit={submit}>
          <label className="field field--dark"><span>{t("cateringDate")}</span><input type="date" min={nowInMalmo().date} value={date} onChange={(e) => setDate(e.target.value)} required /></label>
          <label className="field field--dark"><span>{t("cateringGuests")}</span><input type="number" min="5" step="1" inputMode="numeric" placeholder="30" value={guests} onChange={(e) => setGuests(e.target.value)} required /></label>
          <button className="btn btn--gold" type="submit">{t("cateringSubmit")}</button>
        </form>
      </div>
    </section>
  );
}
