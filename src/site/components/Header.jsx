import { useEffect, useRef, useState } from "react";
import { useSite } from "../context.js";
import { IconBag, IconGlobe, IconMenu, IconUser } from "../icons.jsx";

const LANGS = [
  { code: "sv", label: "Svenska" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" }
];

export default function Header() {
  const { t, lang, setLang, customer, firebaseReady, openAuth, openCart, totals, bump } = useSite();
  const [langOpen, setLangOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bumping, setBumping] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDoc = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    if (!bump) return undefined;
    setBumping(true);
    const id = setTimeout(() => setBumping(false), 420);
    return () => clearTimeout(id);
  }, [bump]);

  const choose = (code) => { setLang(code); setLangOpen(false); setNavOpen(false); };
  const user = customer.user;
  const links = [
    ["#menu", t("navMenu")],
    ["#about", t("navAbout")],
    ["#catering", t("navCatering")],
    ["#contact", t("navContact")]
  ];

  return (
    <header className={`topbar${scrolled ? " scrolled" : ""}`} id="topbar">
      <div className="topbar-inner">
        <a className="brand" href="#home" aria-label="Beirut Bites">
          <img className="brand-logo" src="images/logo.webp" alt="" width="44" height="44" />
          <span className="brand-text">
            <strong>Beirut Bites</strong>
            <small>{t("brandSubtitle")}</small>
          </span>
        </a>

        <nav className="nav" aria-label={t("navAria")}>
          {links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </nav>

        <div className="topbar-actions">
          <div className={`lang${langOpen ? " open" : ""}`} ref={langRef}>
            <button className="icon-pill" type="button" aria-haspopup="true" aria-expanded={langOpen} aria-label={t("langAria")}
              onClick={(e) => { e.stopPropagation(); setLangOpen((o) => !o); }}>
              <IconGlobe />
              <span>{lang.toUpperCase()}</span>
            </button>
            <div className="lang-menu" role="menu">
              {LANGS.map((l) => (
                <button key={l.code} className={`lang-option${lang === l.code ? " active" : ""}`} role="menuitemradio"
                  aria-checked={lang === l.code} type="button" onClick={() => choose(l.code)}>{l.label}</button>
              ))}
            </div>
          </div>

          {firebaseReady && (
            <button id="auth-trigger" className="icon-pill account-btn" type="button" onClick={openAuth}>
              <IconUser />
              <span id="auth-trigger-label">{user ? (user.name || "").split(" ")[0] || t("authTitle") : t("authLoginTab")}</span>
              {user && <span className="points-chip">{Number(user.points) || 0} {t("pointsLabel")}</span>}
            </button>
          )}

          <button id="cart-toggle" className={`cart-button${bumping ? " bump" : ""}`} type="button" aria-label={t("openCart")} onClick={openCart}>
            <IconBag />
            {totals.count > 0 && <span className="cart-count">{totals.count}</span>}
          </button>

          <button className="icon-pill nav-toggle" type="button" aria-expanded={navOpen} aria-controls="mobile-nav" aria-label={t("navMenu")}
            onClick={() => setNavOpen((o) => !o)}>
            <IconMenu />
          </button>
        </div>
      </div>

      {navOpen && (
        <nav id="mobile-nav" className="mobile-nav" onClick={(e) => { if (e.target.closest("a")) setNavOpen(false); }}>
          {links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          <div className="mobile-langs" role="group" aria-label={t("langAria")}>
            {LANGS.map((l) => (
              <button key={l.code} type="button" className={`lang-option${lang === l.code ? " active" : ""}`} onClick={() => choose(l.code)}>{l.label}</button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
