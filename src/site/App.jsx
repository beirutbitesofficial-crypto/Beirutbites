import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES } from "../data/menu.js";
import { I18N } from "./i18n.js";
import { SiteContext } from "./context.js";
import { useCart, useCustomer, useMinuteTick, useSettings } from "./hooks.js";
import { fill, kr, storage } from "../lib/utils.js";
import { firebaseReady } from "../firebase.js";
import Header from "./components/Header.jsx";
import TruckScene from "./components/TruckScene.jsx";
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
import OfferSheet from "./components/OfferSheet.jsx";
import ProductSheet from "./components/ProductSheet.jsx";
import OvenBuilder from "./components/OvenBuilder.jsx";
import { builderKind, toppingsPrice } from "./builder.js";
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
  const [offerOpen, setOfferOpen] = useState(false);
  const [builderId, setBuilderId] = useState(null);
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
    const lock = cartOpen || authOpen || sheetId || builderId;
    document.body.classList.toggle("no-scroll", Boolean(lock));
  }, [cartOpen, authOpen, sheetId, builderId]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (builderId) setBuilderId(null);
      else if (sheetId) setSheetId(null);
      else if (authOpen) setAuthOpen(false);
      else if (cartOpen) setCartOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [builderId, sheetId, authOpen, cartOpen]);

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
  const vegPrice = settings.vegPrice;

  // A deal is either "N× one dish" (productId) or "N of anything in a category" (category).
  const activeDeal = useMemo(() => {
    const d = settings.deal;
    if (!d || !d.enabled || !(d.qty > 1)) return null;
    const qty = Number(d.qty), price = Number(d.price);
    if (d.category) {
      const c = CATEGORIES.find((x) => x.id === d.category);
      const exclude = d.exclude || [];
      const matches = (p) => p.category === c.id && !exclude.includes(p.id);
      if (!c || !products.some((p) => matches(p) && !p.hidden && !p.soldOut)) return null;
      return { category: c.id, name: c.name, qty, price, matches };
    }
    const p = findProduct(d.productId);
    if (!p || p.hidden || p.soldOut) return null;
    return { product: p, name: p.name, qty, price, matches: (x) => x.id === p.id };
  }, [settings.deal, products, findProduct]);

  const unitPrice = useCallback((l) => {
    const p = findProduct(l.id);
    if (!p) return 0;
    return Number(p.price) + (l.extra ? extraPrice : 0) + toppingsPrice(builderKind(p) || p.category, l.toppings, extraPrice, vegPrice);
  }, [findProduct, extraPrice, vegPrice]);

  const totals = useMemo(() => {
    const subtotal = cartApi.cart.reduce((s, l) => s + unitPrice(l) * l.qty, 0);
    let discount = 0;
    if (activeDeal) {
      // Every full set of deal items (cheapest first) costs the deal price instead.
      const units = [];
      cartApi.cart.forEach((l) => {
        const p = findProduct(l.id);
        if (p && activeDeal.matches(p)) for (let i = 0; i < l.qty; i++) units.push(Number(p.price));
      });
      units.sort((a, b) => a - b);
      const sets = Math.floor(units.length / activeDeal.qty);
      for (let i = 0; i < sets; i++) {
        const normal = units.slice(i * activeDeal.qty, (i + 1) * activeDeal.qty).reduce((s, n) => s + n, 0);
        discount += Math.max(0, normal - activeDeal.price);
      }
    }
    const count = cartApi.cart.reduce((s, l) => s + l.qty, 0);
    return { subtotal, discount, total: Math.max(0, subtotal - discount), count };
  }, [cartApi.cart, unitPrice, activeDeal, findProduct]);

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
    if (builderKind(p)) { setBuilderId(id); return; }
    const o = productOptions(p);
    if (!o.spice && !o.extra) addToCart(id, {});
    else setSheetId(id);
  }, [findProduct, productOptions, addToCart]);

  const ctx = {
    lang, setLang, t, loc, settings, products, tick, kr,
    customer, firebaseReady,
    cart: cartApi.cart, lineKey: cartApi.lineKey, changeQty: cartApi.change, clearCart: cartApi.clear,
    totals, activeDeal, unitPrice, extraPrice, vegPrice, findProduct, findCategory, productOptions,
    addToCart, openProduct, showToast, bump, openOffer: () => setOfferOpen(true),
    openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false), cartOpen,
    openAuth: () => { if (firebaseReady) setAuthOpen(true); }, closeAuth: () => setAuthOpen(false)
  };

  return (
    <SiteContext.Provider value={ctx}>
      <a className="skip-link" href="#menu">{t("skipToMenu")}</a>
      <Header />
      <main>
        <TruckScene />
        <Menu active={activeCat} setActive={setActiveCat} />
        <SpecialBanner />
        <Marquee onPick={setActiveCat} />
        <Collections onPick={setActiveCat} />
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
      {offerOpen && <OfferSheet onClose={() => setOfferOpen(false)} />}
      {sheetId && <ProductSheet id={sheetId} onClose={() => setSheetId(null)} />}
      {builderId && <OvenBuilder id={builderId} onClose={() => setBuilderId(null)} />}
      {authOpen && <AuthModal />}

      <div className={`toast${toast.show && !cartOpen ? " show" : ""}`} role="status" aria-live="polite">{toast.msg}</div>
    </SiteContext.Provider>
  );
}
