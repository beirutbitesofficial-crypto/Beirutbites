import { useSite } from "../context.js";
import { IconFlame, IconLeaf, IconTimer } from "../icons.jsx";

export default function About() {
  const { t } = useSite();
  const points = [
    [IconFlame, "aboutPoint1Title", "aboutPoint1"],
    [IconLeaf, "aboutPoint2Title", "aboutPoint2"],
    [IconTimer, "aboutPoint3Title", "aboutPoint3"]
  ];
  return (
    <section id="about" className="about">
      <div className="about-copy">
        <h2>{t("aboutTitle")}</h2>
        <p>{t("aboutDescription")}</p>
      </div>
      <ul className="about-points">
        {points.map(([Icon, title, text]) => (
          <li key={title}>
            <Icon />
            <div><strong>{t(title)}</strong><span>{t(text)}</span></div>
          </li>
        ))}
      </ul>
    </section>
  );
}
