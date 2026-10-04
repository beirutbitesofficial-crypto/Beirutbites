import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES } from "../data/menu.js";
import { I18N } from "./i18n.js";
import { SiteContext } from "./context.js";
import { useCart, useCustomer, useMinuteTick, useSettings } from "./hooks.js";
import { fill, kr, storage } from "../lib/utils.js";
import { firebaseReady } from "../firebase.js";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import SpecialBanner from "./components/SpecialBanner.jsx";
import Menu from "./components/Menu.jsx";
import Marquee from "./components/Marquee.jsx";
import Collections from "./components/Collections.jsx";
import Story from "./components/Story.jsx";
import Promises from "./components/Promises.jsx";
import { useReveal } from "./motion/useReveal.js";
import { useHeroMotion } from "./motion/useHeroMotion.js";
import Reviews from "./components/Reviews.jsx";
import Catering from "./components/Catering.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import ProductSheet from "./components/ProductSheet.jsx";
import AuthModal from "./components/AuthModal.jsx";

function detectLanguage() {
  const saved = storage("bb_lang");
  if (saved && I18N[saved]) return saved;
  const nav = (navigator.language || "sv").slice(0, 2).toLowerCase();
  if (nav === "ar") return "ar";
  if (["sv", "da", "nb", "no"].includes(nav)) return "sv";
  return "en";
}

export default function App() {
  const [lang, setLangState] = useState(detectLanguage);
  const settings = useSettings();
  const products = settings.products;
  const tick = useMinuteTick();
  const customer = useCustomer();
  const cartApi = useCart(products);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [sheetId, setSheetId] = useState(null);
  const [toast, setToast] = useState({ msg: "", show: false });
  const toastTimer = useRef(null);
  const [bump, setBump] = useState(0);
  const [activeCat, setActiveCat] = useState("all");
  useReveal();
  useHeroMotion();

  const t = useCallback((key, vars) => {
    const dict = I18N[lang] || I18N.sv;
    const s = dict[key] != null ? dict[key] : I18N.sv[key] != null ? I18N.sv[key] : key;
    return fill(s, vars);
  }, [lang]);
  const loc = useCallback((o) => (!o ? "" : typeof o === "string" ? o : o[lang] || o.sv || o.en || ""), [lang]);

  const setLang = (l) => { setLangState(l); storage("bb_lang", l); };

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t("title");
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", t("description"));
  }, [lang, t]);

  useEffect(() => {
    const lock = cartOpen || authOpen || sheetId;
    document.body.classList.toggle("no-scroll", Boolean(lock));
  }, [cartOpen, authOpen, sheetId]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (sheetId) setSheetId(null);
      else if (authOpen) setAuthOpen(false);
      else if (cartOpen) setCartOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheetId, authOpen, cartOpen]);

  const showToast = useCallback((msg) => {
    setToast({ msg, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((x) => ({ ...x, show: false })), 2400);
  }, []);

  const findProduct = useCallback((id) => products.find((p) => p.id === id) || null, [products]);
  const findCategory = (id) => CATEGORIES.find((c) => c.id === id) || { id, icon: "🍴", name: { sv: id, en: id, ar: id }, options: {} };
  const productOptions = useCallback((p) => {
    const o = findCategory(p.category).options || {};
    return {
      spice: p.spice !== undefined ? Boolean(p.spice) : Boolean(o.spice),
      extra: p.extra !== undefined ? Boolean(p.extra) : Boolean(o.extra)
    };
  }, []);
  const extraPrice = Number(settings.extraPrice) || 0;

  const activeDeal = useMemo(() => {
    const d = settings.deal;
    if (!d || !d.enabled || !d.productId || !(d.qty > 1)) return null;
    const p = findProduct(d.productId);
    if (!p || p.hidden || p.soldOut) return null;
    return { product: p, qty: Number(d.qty), price: Number(d.price) };
  }, [settings.deal, findProduct]);

  const unitPrice = useCallback((l) => {
    const p = findProduct(l.id);
    return p ? Number(p.price) + (l.extra ? extraPrice : 0) : 0;
  }, [findProduct, extraPrice]);

  const totals = useMemo(() => {
    const subtotal = cartApi.cart.reduce((s, l) => s + unitPrice(l) * l.qty, 0);
    let discount = 0;
    if (activeDeal) {
      const qty = cartApi.cart.filter((l) => l.id === activeDeal.product.id).reduce((s, l) => s + l.qty, 0);
      const sets = Math.floor(qty / activeDeal.qty);
      discount = Math.max(0, (Number(activeDeal.product.price) * activeDeal.qty - activeDeal.price) * sets);
    }
    const count = cartApi.cart.reduce((s, l) => s + l.qty, 0);
    return { subtotal, discount, total: Math.max(0, subtotal - discount), count };
  }, [cartApi.cart, unitPrice, activeDeal]);

  const addToCart = useCallback((id, opts, qty) => {
    const p = findProduct(id);
    if (!p || p.soldOut) return;
    cartApi.add(id, opts, qty);
    showToast(t("addedToCart", { name: loc(p.name) }));
    setBump((b) => b + 1);
  }, [findProduct, cartApi, showToast, t, loc]);

  const openProduct = useCallback((id) => {
    const p = findProduct(id);
    if (!p || p.soldOut) return;
    const o = productOptions(p);
    if (!o.spice && !o.extra) addToCart(id, {});
    else setSheetId(id);
  }, [findProduct, productOptions, addToCart]);

  const ctx = {
    lang, setLang, t, loc, settings, products, tick, kr,
    customer, firebaseReady,
    cart: cartApi.cart, lineKey: cartApi.lineKey, changeQty: cartApi.change, clearCart: cartApi.clear,
    totals, activeDeal, unitPrice, extraPrice, findProduct, productOptions,
    addToCart, openProduct, showToast, bump,
    openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false), cartOpen,
    openAuth: () => { if (firebaseReady) setAuthOpen(true); }, closeAuth: () => setAuthOpen(false)
  };

  return (
    <SiteContext.Provider value={ctx}>
      <a className="skip-link" href="#menu">{t("skipToMenu")}</a>
      <Header />
      <main>
        <Hero />
        <Marquee onPick={setActiveCat} />
        <Collections onPick={setActiveCat} />
        <SpecialBanner />
        <Menu active={activeCat} setActive={setActiveCat} />
        <Story />
        <Reviews />
        <Catering />
        <Contact />
        <Promises />
      </main>
      <Footer />

      {totals.count > 0 && !cartOpen && (
        <button className="cart-bar" type="button" onClick={() => setCartOpen(true)}>
          <b>{totals.count}</b>
          <span>{t("viewCart")}</span>
          <strong id="cart-bar-total">{kr(totals.total)}</strong>
        </button>
      )}

      <CartDrawer />
      {sheetId && <ProductSheet id={sheetId} onClose={() => setSheetId(null)} />}
      {authOpen && <AuthModal />}

      <div className={`toast${toast.show && !cartOpen ? " show" : ""}`} role="status" aria-live="polite">{toast.msg}</div>
    </SiteContext.Provider>
  );
}
