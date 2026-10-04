import { useSite } from "../context.js";
import { IconInstagram, IconTikTok, IconWhatsApp } from "../icons.jsx";

export default function Footer() {
  const { t } = useSite();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div>
            <div className="site-footer__mark">BEIRUT BITES</div>
            <p className="site-footer__tag">{t("footerTag")}</p>
            <p className="site-footer__copy">{t("footerCopy")}</p>
            <div className="site-footer__social">
              <a href="https://wa.me/46790499644" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><IconWhatsApp /></a>
              <a href="https://www.instagram.com/beirutbites.46" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IconInstagram /></a>
              <a href="https://www.tiktok.com/@beirut.bites.official" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><IconTikTok /></a>
            </div>
          </div>
          <div className="site-footer__cols">
            <div>
              <h4>{t("footerMenu")}</h4>
              <a href="#menu">{t("catManakish")}</a>
              <a href="#menu">{t("catWraps")}</a>
              <a href="#menu">{t("catPizza")}</a>
              <a href="#catering">{t("navCatering")}</a>
            </div>
            <div>
              <h4>{t("footerTruck")}</h4>
              <a href="#contact">Malmö</a>
              <a href="#contact">{t("statusHours")}</a>
              <a href="mailto:media@beirutbites.shop">media@beirutbites.shop</a>
            </div>
            <div>
              <h4>{t("footerOrder")}</h4>
              <a href="https://wa.me/46790499644" target="_blank" rel="noopener noreferrer" dir="ltr">+46 790 499 644</a>
              <span>{t("meta")[2]}</span>
              <span>{t("meta")[1]}</span>
            </div>
          </div>
        </div>
        <div className="site-footer__giant" aria-hidden="true" data-giant>Beirut Bites</div>
        <div className="site-footer__bottom">
          <p>© {new Date().getFullYear()} BEIRUT BITES — {t("footerRights")}</p>
          <p>{t("footerMade")} · <a href="admin.html" rel="nofollow">Admin</a></p>
        </div>
      </div>
    </footer>
  );
}
