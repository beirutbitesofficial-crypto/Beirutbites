import { useSite } from "../context.js";

export default function Footer() {
  const { t } = useSite();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="images/logo.webp" alt="" width="56" height="56" loading="lazy" />
          <p>{t("footerAbout")}</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <a href="#menu">{t("navMenu")}</a>
          <a href="#about">{t("navAbout")}</a>
          <a href="#catering">{t("navCatering")}</a>
          <a href="#contact">{t("navContact")}</a>
        </nav>
        <p className="footer-copy">{new Date().getFullYear()} © Beirut Bites</p>
      </div>
    </footer>
  );
}
