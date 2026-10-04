import { useEffect, useState } from "react";
import { useSite } from "../context.js";
import { IconBag, IconClose, IconUser } from "../icons.jsx";

const LANGS = [["sv", "SV"], ["en", "EN"], ["ar", "عربي"]];

export default function Header() {
  const { t, lang, setLang, customer, firebaseReady, openAuth, openCart, totals, bump } = useSite();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bumping, setBumping] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!bump) return undefined;
    setBumping(true);
    const id = setTimeout(() => setBumping(false), 460);
    return () => clearTimeout(id);
  }, [bump]);
  useEffect(() => {
    document.body.classList.toggle("no-scroll", open);
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const user = customer.user;
  const links = [["#menu", t("navMenu")], ["#about", t("navAbout")], ["#catering", t("navCatering")], ["#contact", t("navContact")]];
  const announce = t("announce");

  return (
    <>
      <div className="announce" aria-hidden="true">
        <div className="announce__track">
          {[0, 1].map((r) => (
            <div className="announce__group" key={r}>
              {announce.map((a) => <span key={a + r}>{a}</span>).reduce((acc, el, i) => acc.concat(el, <i key={`i${i}${r}`}>✦</i>), [])}
            </div>
          ))}
        </div>
      </div>

      <header className={`site-header${scrolled ? " is-scrolled" : ""}`} id="topbar">
        <div className="site-header__inner">
          <button className="burger" type="button" aria-label={t("navMenu")} aria-controls="nav-drawer" aria-expanded={open} onClick={() => setOpen(true)}>
            <span /><span />
          </button>
          <nav className="site-nav" aria-label={t("navAria")}>
            {links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          </nav>

          <a href="#home" className="wordmark" aria-label="Beirut Bites">
            <img src="images/logo.webp" alt="" width="46" height="46" />
            <span className="wordmark__text">
              <span className="wordmark__name">BEIRUT BITES</span>
              <span className="wordmark__sub">Street Food · <span lang="ar">بيروت بايتس</span></span>
            </span>
          </a>

          <div className="site-actions">
            <div className="lang-switch" role="group" aria-label={t("langAria")}>
              {LANGS.map(([code, label]) => (
                <button key={code} type="button" className={`chip${lang === code ? " is-active" : ""}`} aria-pressed={lang === code} onClick={() => setLang(code)}>{label}</button>
              ))}
            </div>
            {firebaseReady && (
              <button id="auth-trigger" type="button" className="account-btn" onClick={openAuth} aria-label={t("authTitle")}>
                <IconUser />
                <span className="account-btn__label" id="auth-trigger-label">{user ? (user.name || "").split(" ")[0] || t("authTitle") : t("authLoginTab")}</span>
                {user && <span className="account-btn__pts">{Number(user.points) || 0} {t("pointsLabel")}</span>}
              </button>
            )}
            <button id="cart-toggle" type="button" className={`icon-btn${bumping ? " bump" : ""}`} aria-label={t("openCart")} onClick={openCart}>
              <IconBag strokeWidth={1.3} />
              {totals.count > 0 && <span className="icon-btn__badge">{totals.count}</span>}
            </button>
          </div>
        </div>
      </header>

      <div className={`scrim${open ? " is-open" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`nav-drawer${open ? " is-open" : ""}`} id="nav-drawer" aria-hidden={!open}>
        <div className="nav-drawer__head">
          <span className="nav-drawer__brand">BEIRUT BITES</span>
          <button className="nav-drawer__close" type="button" aria-label={t("close")} onClick={() => setOpen(false)}><IconClose /></button>
        </div>
        <nav className="nav-drawer__nav" onClick={(e) => { if (e.target.closest("a")) setOpen(false); }}>
          <a href="#home"><span>00</span>{t("navHome")}</a>
          {links.map(([href, label], i) => <a key={href} href={href}><span>{String(i + 1).padStart(2, "0")}</span>{label}</a>)}
        </nav>
        <div className="nav-drawer__foot">
          <div className="lang-switch" style={{ display: "flex" }} role="group" aria-label={t("langAria")}>
            {LANGS.map(([code, label]) => (
              <button key={code} type="button" className={`chip${lang === code ? " is-active" : ""}`} aria-pressed={lang === code} onClick={() => { setLang(code); setOpen(false); }}>{label}</button>
            ))}
          </div>
          <a className="nav-drawer__wa" href="https://wa.me/46790499644" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>
        </div>
      </aside>
    </>
  );
}
