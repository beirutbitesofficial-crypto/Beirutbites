import { useSite } from "../context.js";

export default function Promises() {
  const { t } = useSite();
  return (
    <section className="promises">
      <div className="container promises__grid">
        {[1, 2, 3].map((n, i) => (
          <div key={n} className="reveal" style={{ "--d": `${i * 0.1}s` }}>
            <span className="promises__icon">✦</span>
            <strong>{t(`aboutPoint${n}Title`)}</strong>
            <p>{t(`aboutPoint${n}`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
