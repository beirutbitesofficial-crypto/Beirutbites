import { useEffect, useMemo, useRef, useState } from "react";
import { useSite } from "../context.js";
import { IconClose } from "../icons.jsx";
import { TOPPINGS, baseOf, builderKind, isVeggie, toppingList, toppingsPrice, vegPriceFor } from "../builder.js";

const MAX_EACH = 2;
const FIRE_MS = 2200;

// Small deterministic random so pieces don't jump around between renders.
function seeded(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function scatter(key, count, radius = 70) {
  const rnd = seeded(key);
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(0.04 + rnd() * 0.96) * radius;
    out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, rot: rnd() * 360, s: 0.85 + rnd() * 0.3 });
  }
  return out;
}

/* One topping piece, drawn around 0,0. */
function Piece({ type }) {
  switch (type) {
    case "cheese":
      return <rect x="-4.5" y="-1.1" width="9" height="2.2" rx="1.1" fill="#fff6d8" stroke="#f0d98c" strokeWidth=".4" />;
    case "cheeseMelt":
      return <ellipse rx="7" ry="5" fill="#f8e7a8" opacity=".9" />;
    case "olives":
      return <g><circle r="4.2" fill="#2a2321" stroke="#7a675b" strokeWidth=".7" /><circle r="1.7" fill="#5a3b2e" /><circle cx="-1.6" cy="-1.6" r=".8" fill="#fff" opacity=".35" /></g>;
    case "mushroom":
      return <g><path d="M-6 0a6 5 0 0 1 12 0z" fill="#d8c3a2" stroke="#a88c66" strokeWidth=".6" /><rect x="-1.7" y="0" width="3.4" height="4.6" rx="1" fill="#efe3cf" stroke="#a88c66" strokeWidth=".5" /></g>;
    case "peppers":
      return <path d="M-6 2a7 7 0 0 1 12 0" fill="none" stroke="#3f9a3c" strokeWidth="2.6" strokeLinecap="round" />;
    case "onion":
      return <g fill="none" stroke="#9b4a8c" strokeLinecap="round"><path d="M-6 1a6 6 0 0 1 12 0" strokeWidth="1.6" /><path d="M-3.6 1a3.6 3.6 0 0 1 7.2 0" strokeWidth="1.1" opacity=".8" /></g>;
    case "tomato":
      return <g><circle r="7" fill="#d93a25" /><circle r="5.2" fill="#ee5a3b" /><g fill="#f7c76a"><ellipse cx="-2.2" cy="-1" rx=".9" ry="1.4" /><ellipse cx="2.2" cy="-1" rx=".9" ry="1.4" /><ellipse cx="0" cy="2.4" rx="1.4" ry=".9" /></g></g>;
    case "sujuk":
      return <g><circle r="6.6" fill="#7d1f16" /><circle r="5.4" fill="#a4301f" /><g fill="#e9b7a0"><circle cx="-2" cy="-1.5" r=".9" /><circle cx="1.8" cy="1.6" r=".8" /><circle cx="2" cy="-2.2" r=".6" /><circle cx="-1.5" cy="2.4" r=".6" /></g></g>;
    case "salami":
      return <g><circle r="8" fill="#a4231b" /><circle r="6.8" fill="#c8392b" /><g fill="#f1c4b4"><circle cx="-2.5" cy="-2" r="1" /><circle cx="2.4" cy="1.8" r="1" /><circle cx="2.6" cy="-2.8" r=".7" /><circle cx="-2" cy="3" r=".8" /></g></g>;
    case "jalapeno":
      return <g><circle r="4.4" fill="#4f9a2f" /><circle r="2.9" fill="#bfe07d" /><g fill="#f4f6d8"><circle cx="-1" r=".6" /><circle cx="1" cy=".4" r=".6" /><circle cy="-1.1" r=".6" /></g></g>;
    case "labneh":
      return <g><path d="M-6 0c0-4 4-6 7-5s5 3 5 5-3 5-6 5-6-1-6-5z" fill="#fbf8f1" /><path d="M-3-1c1-2 4-2 5 0" fill="none" stroke="#e6dccb" strokeWidth=".8" /><circle cx="1" cy="1" r=".7" fill="#3f6b2f" /></g>;
    case "cucumber":
      return <g><circle r="6" fill="#2f6b2a" /><circle r="5" fill="#cfe7a9" /><g fill="#f5f9e6"><circle cx="-1.6" cy="-.8" r=".7" /><circle cx="1.6" cy="-.8" r=".7" /><circle cy="1.8" r=".7" /></g></g>;
    case "mint":
    case "basil":
      return <g><path d="M0-6c4 2 5 7 0 10-5-3-4-8 0-10z" fill={type === "mint" ? "#4fb062" : "#2f8a3a"} /><path d="M0-5v8" stroke="#1f5a2a" strokeWidth=".6" /></g>;
    case "chicken":
      return <rect x="-5" y="-3.5" width="10" height="7" rx="2.6" fill="#e2b06b" stroke="#b9823f" strokeWidth=".6" />;
    case "kebab":
      return <path d="M-7-1.5q7-3 14 0v3q-7-3-14 0z" fill="#8a4b25" stroke="#5e2f14" strokeWidth=".5" />;
    case "meat":
      return <circle r="2.6" fill="#6e3a20" stroke="#4a2410" strokeWidth=".5" />;
    case "zaatarSpecks":
      return <circle r="1.4" fill="#4f5a22" />;
    default:
      return <circle r="3" fill="#ccc" />;
  }
}

const PIECES = { salami: 8, chicken: 10, kebab: 10, basil: 6, meat: 30, zaatarSpecks: 40, cheeseMelt: 8 };
const piecesFor = (k) => (TOPPINGS[k] ? TOPPINGS[k].pieces : PIECES[k] || 8);

const SPREADS = {
  pizza: { fill: "#c8361f", melt: "#f7d98a" },
  dough: { fill: "#f0d6a2" },
  zaatar: { fill: "#4d4a22", specks: "#7a7a3a" },
  cheese: { fill: "#f6e3a4", top: "#fbeec2" },
  muhammara: { fill: "#b8452b", specks: "#d9714d" },
  kishk: { fill: "#c6995a", specks: "#9c6f35" },
  meat: { fill: "#8a4a2a", specks: "#5f2e17" }
};

function Dish({ base, toppings, baked, dropKey }) {
  const sp = SPREADS[base.spread] || SPREADS.dough;
  const specks = useMemo(() => scatter(`specks-${base.spread}`, 70, 78), [base.spread]);
  const layers = [];
  base.built.forEach((k) => layers.push({ k, n: piecesFor(k), key: `b-${k}`, fresh: false }));
  Object.keys(toppings).forEach((k) => {
    for (let i = 0; i < toppings[k]; i++) {
      layers.push({ k, n: piecesFor(k), key: `t-${k}-${i}`, fresh: dropKey === `${k}-${i}` });
    }
  });
  // Cheese goes under everything else.
  layers.sort((a, b) => (a.k === "cheese" ? -1 : 0) - (b.k === "cheese" ? -1 : 0));

  return (
    <svg className={`oven-dish${baked ? " is-baked" : ""}`} viewBox="-100 -100 200 200" aria-hidden="true">
      <defs>
        <radialGradient id="ob-crust" r=".5">
          <stop offset=".82" stopColor="#f3d29a" />
          <stop offset=".93" stopColor="#e2b36c" />
          <stop offset="1" stopColor="#c48a45" />
        </radialGradient>
        <radialGradient id="ob-bake" r=".5">
          <stop offset=".6" stopColor="#7a3a0c" stopOpacity="0" />
          <stop offset="1" stopColor="#7a3a0c" stopOpacity=".45" />
        </radialGradient>
      </defs>
      <circle r="96" fill="url(#ob-crust)" />
      <circle r="83" fill={sp.fill} />
      {sp.top && <circle r="76" fill={sp.top} opacity={base.spread === "pizza" ? 0.55 : 0.6} />}
      {sp.melt && specks.slice(0, 22).map((p, i) => <ellipse key={i} cx={p.x * 0.85} cy={p.y * 0.85} rx={9 + p.s * 6} ry={7 + p.s * 5} transform={`rotate(${p.rot.toFixed(0)} ${(p.x * 0.85).toFixed(1)} ${(p.y * 0.85).toFixed(1)})`} fill={sp.melt} opacity=".72" />)}
      {sp.specks && specks.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={0.9 + p.s} fill={sp.specks} opacity=".8" />)}
      {layers.map((l) => (
        <g key={l.key} className={l.fresh ? "is-fresh" : undefined}>
          {scatter(l.key, l.n, l.k === "cheese" ? 74 : 68).map((p, i) => (
            <g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(0)}) scale(${p.s.toFixed(2)})`}>
              <g className="oven-piece" style={{ animationDelay: `${(i * 28) % 420}ms` }}><Piece type={l.k} /></g>
            </g>
          ))}
        </g>
      ))}
      <circle className="oven-dish__bake" r="96" fill="url(#ob-bake)" />
    </svg>
  );
}

export default function OvenBuilder({ id, onClose }) {
  const { t, loc, kr, findProduct, extraPrice, vegPrice, addToCart, findCategory } = useSite();
  const p = findProduct(id);
  const kind = builderKind(p);
  const [toppings, setToppings] = useState({});
  const [dropKey, setDropKey] = useState("");
  const [stage, setStage] = useState("build"); // build → firing → ready
  const [drag, setDrag] = useState(null);
  const dishRef = useRef(null);
  const closeRef = useRef(null);
  const fireTimer = useRef(null);
  const reduced = typeof window !== "undefined" && window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => { closeRef.current && closeRef.current.focus(); return () => clearTimeout(fireTimer.current); }, []);
  if (!p || !kind) return null;

  const base = baseOf(p);
  const list = toppingList(kind);
  const count = Object.values(toppings).reduce((s, n) => s + n, 0);
  const added = [];
  Object.keys(toppings).forEach((k) => { for (let i = 0; i < toppings[k]; i++) added.push(k); });
  const extraCost = toppingsPrice(kind, added, extraPrice, vegPrice);
  const price = Number(p.price) + extraCost;
  const chipPrice = (k) => (isVeggie(k) ? vegPriceFor(kind, vegPrice, extraPrice) : extraPrice);
  const accent = loc(findCategory(p.category).name).toLowerCase();

  const resetBake = () => { clearTimeout(fireTimer.current); setStage("build"); };

  const addOne = (k) => {
    const n = toppings[k] || 0;
    if (n >= MAX_EACH) return;
    setToppings({ ...toppings, [k]: n + 1 });
    setDropKey(`${k}-${n}`);
    resetBake();
  };
  // Tap cycles: none → on → double → none.
  const tap = (k) => {
    const n = toppings[k] || 0;
    if (n >= MAX_EACH) {
      const next = { ...toppings };
      delete next[k];
      setToppings(next);
      resetBake();
    } else addOne(k);
  };

  const onPointerDown = (e, k) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ k, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, moved: false, over: false });
  };
  const onPointerMove = (e) => {
    if (!drag) return;
    const moved = drag.moved || Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 8;
    const r = dishRef.current && dishRef.current.getBoundingClientRect();
    const over = Boolean(r && Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < r.width / 2);
    setDrag({ ...drag, x: e.clientX, y: e.clientY, moved, over });
  };
  const onPointerUp = () => {
    if (!drag) return;
    if (!drag.moved) tap(drag.k);
    else if (drag.over) addOne(drag.k);
    setDrag(null);
  };

  const fire = () => {
    if (stage !== "build") return;
    if (reduced) { setStage("ready"); return; }
    setStage("firing");
    fireTimer.current = setTimeout(() => setStage("ready"), FIRE_MS);
  };

  const confirm = () => {
    addToCart(p.id, { toppings: added }, 1);
    onClose();
  };

  const doubled = Object.keys(toppings).find((k) => toppings[k] === MAX_EACH && dropKey === `${k}-1`);
  const hint = stage === "firing" ? t("builderFiring")
    : stage === "ready" ? t("builderReady")
    : doubled ? t("builderDouble", { name: loc(TOPPINGS[doubled].name) })
    : count ? t("builderLooksGood") : t("builderHint", { dish: accent });

  return (
    <div className="modal oven-modal">
      <div className="panel-scrim" onClick={onClose} />
      <div className={`oven stage-${stage}`} role="dialog" aria-modal="true" aria-labelledby="ob-title">
        <header className="oven__head">
          <h2 id="ob-title"><span>{t("builderBuild")}</span> <em>{accent}</em></h2>
          <button ref={closeRef} className="close-btn" type="button" aria-label={t("close")} onClick={onClose}><IconClose /></button>
        </header>
        <p className="oven__name">{loc(p.name)}</p>

        <div className={`oven__stage${drag && drag.over ? " is-target" : ""}`} ref={dishRef}>
          <div className="oven__fire" aria-hidden="true"><i /><i /><i /></div>
          <Dish base={base} toppings={toppings} baked={stage !== "build"} dropKey={dropKey} />
        </div>

        <p className="oven__hint" aria-live="polite">{hint}</p>

        <ul className="oven__toppings" aria-label={t("builderToppings")}>
          {list.map((k) => {
            const n = toppings[k] || 0;
            return (
              <li key={k}>
                <button type="button" className={`chip-top${n ? " is-on" : ""}`} aria-pressed={n > 0}
                  aria-label={`${loc(TOPPINGS[k].name)}${n ? ` ×${n}` : ""}, +${kr(chipPrice(k))}`}
                  onPointerDown={(e) => onPointerDown(e, k)} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
                  onPointerCancel={() => setDrag(null)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(k); } }}>
                  <span className="chip-top__icon">
                    <svg viewBox="-10 -10 20 20" aria-hidden="true"><Piece type={k} /></svg>
                    {n > 0 && <b>{n > 1 ? `×${n}` : "✓"}</b>}
                  </span>
                  <span className="chip-top__name">{loc(TOPPINGS[k].name)}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="oven__foot">
          {stage === "ready" ? (
            <button type="button" className="oven-btn" onClick={confirm}>
              <span>{t("builderAdd")}</span><strong>{kr(price)}</strong>
            </button>
          ) : (
            <button type="button" className="oven-btn" onClick={fire} disabled={stage === "firing"} style={{ "--fire-ms": `${FIRE_MS}ms` }}>
              <span>{stage === "firing" ? t("builderFiringShort") : t("builderFire")}</span>
              <strong>{extraCost > 0 && <small>+{kr(extraCost)}</small>}{kr(price)}</strong>
            </button>
          )}
        </div>
      </div>

      {drag && drag.moved && (
        <div className="oven-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          <svg viewBox="-10 -10 20 20"><Piece type={drag.k} /></svg>
        </div>
      )}
    </div>
  );
}
