import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "../context.js";

// Scroll story under the hero: the truck drives from Beirut to Malmö, the serving
// window lifts open, the camera moves in and a manoushe bakes in the stone oven.
// Everything is one SVG; the scroll position scrubs a single GSAP timeline.

const CAPTIONS = ["truckCap1", "truckCap2", "truckCap3", "truckCap4", "truckCap5"];

// Za'atar specks on the dough (side view, so they sit in a thin ellipse).
const SPECKS = Array.from({ length: 26 }, (_, i) => {
  const a = (i * 137.5 * Math.PI) / 180;
  const r = Math.sqrt((i + 0.5) / 26);
  return [120 + Math.cos(a) * r * 24, 211 + Math.sin(a) * r * 5, i % 3 === 0 ? 1.3 : 0.9];
});
const DASHES = Array.from({ length: 30 }, (_, i) => i * 90);
const SPOKES = [0, 72, 144, 216, 288];
// Truck window centre in scene coordinates (truck is drawn at translate(330 150)).
const WIN = { x: 500, y: 311 };

function Wheel({ x }) {
  return (
    <g data-wheel>
      <circle cx={x} cy="292" r="34" fill="#111612" />
      <circle cx={x} cy="292" r="20" fill="#d9d2c2" />
      {SPOKES.map((a) => (
        <line key={a} x1={x} y1="292" x2={x + Math.cos((a * Math.PI) / 180) * 18} y2={292 + Math.sin((a * Math.PI) / 180) * 18} stroke="#8d877a" strokeWidth="3" />
      ))}
      <circle cx={x} cy="292" r="6" fill="#4a4a44" />
    </g>
  );
}

export default function TruckScene() {
  const { t } = useSite();
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    gsap.registerPlugin(ScrollTrigger);
    const q = (s) => el.querySelector(s);
    const qa = (s) => [...el.querySelectorAll(s)];
    const svg = q("svg");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const els = {
        camera: q("[data-camera]"), truck: q("[data-truck]"), body: q("[data-body]"), wheels: qa("[data-wheel]"),
        far: q("[data-far]"), dashes: q("[data-dashes]"), route: q("[data-route]"),
        hatch: q("[data-hatch]"), rods: q("[data-rods]"), lamps: qa("[data-lamp]"), warm: q("[data-warm]"),
        headlight: q("[data-headlight]"), peel: q("[data-peel]"), dough: q("[data-dough]"), specks: q("[data-specks]"),
        fire: q("[data-fire]"), steam: qa("[data-steam] path"), photo: q("[data-photo]"), caps: qa("[data-cap]")
      };
      const open = { scaleY: -0.34 };
      // Pivots relative to each element's box: wheel hubs, the hatch hinge, the dough on the peel.
      gsap.set(els.wheels, { transformOrigin: "50% 50%" });
      gsap.set(els.hatch, { transformOrigin: "50% 0%" });
      gsap.set(els.peel, { transformOrigin: "75% 50%" });
      gsap.set(els.dough, { transformOrigin: "50% 100%" });

      if (reduce) {
        gsap.set(els.hatch, open);
        gsap.set([els.rods, els.warm, ...els.lamps, els.specks, els.photo], { opacity: 1 });
        gsap.set(els.dough, { fill: "#d9963f" });
        gsap.set(els.route, { strokeDashoffset: 0 });
        gsap.set(els.caps[els.caps.length - 1], { opacity: 1, y: 0 });
        return;
      }

      // Phones: crop the scene around the truck so it fills the screen.
      const mm = gsap.matchMedia();
      mm.add("(max-width: 720px)", () => {
        svg.setAttribute("viewBox", "300 20 600 600");
        svg.setAttribute("preserveAspectRatio", "xMidYMax meet");
        return () => { svg.setAttribute("viewBox", "0 0 1200 600"); svg.setAttribute("preserveAspectRatio", "xMidYMid meet"); };
      });

      gsap.set(els.truck, { x: -1050 });
      gsap.set(els.caps, { opacity: 0, y: 24 });
      gsap.set([els.rods, els.warm, ...els.lamps, els.specks, els.photo, ...els.steam], { opacity: 0 });
      gsap.set(els.photo, { scale: 0.2, rotation: -40, y: 140, transformOrigin: "50% 50%" });
      gsap.set(els.fire, { opacity: 0.35 });

      const cap = (tl, i, from, to) => {
        tl.to(els.caps[i], { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, from);
        if (to !== undefined) tl.to(els.caps[i], { opacity: 0, y: -24, duration: 0.3, ease: "power2.in" }, to);
      };

      const headerH = () => document.getElementById("topbar")?.offsetHeight || 0;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el, start: () => `top top+=${headerH()}`, end: "+=320%",
          pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: -1
        }
      });

      /* 1. Drive in from Beirut to Malmö */
      tl.to(els.truck, { x: 0, duration: 3, ease: "power2.out" }, 0)
        .to(els.wheels, { rotation: 1080, duration: 3, ease: "power2.out" }, 0)
        .to(els.far, { x: -90, duration: 3, ease: "power2.out" }, 0)
        .to(els.dashes, { x: -720, duration: 3, ease: "power2.out" }, 0)
        .to(els.route, { strokeDashoffset: 0, duration: 3, ease: "power1.inOut" }, 0)
        .to(els.headlight, { opacity: 0.25, duration: 0.4 }, 2.8)
        // a little suspension bounce as it stops
        .to(els.body, { y: 4, duration: 0.2, ease: "power1.out" }, 2.85)
        .to(els.body, { y: 0, duration: 0.35, ease: "back.out(3)" }, 3.05);
      cap(tl, 0, 0.1, 2.9);

      /* 2. The serving window lifts open, lights on */
      tl.to(els.hatch, { ...open, duration: 1.1, ease: "power2.inOut" }, 3.4)
        .to(els.rods, { opacity: 1, duration: 0.3 }, 4.2)
        .to(els.warm, { opacity: 1, duration: 0.8 }, 3.7)
        .to(els.lamps, { opacity: 1, duration: 0.2, stagger: 0.15 }, 3.9);
      cap(tl, 1, 3.4, 4.7);

      /* 3. Camera into the window, dough into the oven */
      tl.to(els.camera, { scale: 2.6, x: 600 - WIN.x, y: 300 - WIN.y, svgOrigin: `${WIN.x} ${WIN.y}`, duration: 1.4, ease: "power2.inOut" }, 4.6)
        .to(els.peel, { x: 100, y: -4, scale: 0.72, duration: 1, ease: "power1.inOut" }, 6.1)
        .to(els.fire, { opacity: 1, duration: 0.6 }, 6.5);
      cap(tl, 2, 5.6, 6.9);

      /* 4. Baking: colour, za'atar, a little puff */
      tl.to(els.dough, { fill: "#d9963f", duration: 1.3 }, 7.1)
        .to(els.specks, { opacity: 1, duration: 0.8 }, 7.4)
        .to(els.dough, { scaleY: 1.25, duration: 0.6, yoyo: true, repeat: 1, ease: "sine.inOut" }, 7.2);
      cap(tl, 3, 7.0, 8.4);

      /* 5. Out of the oven, steam, zoom back, the real thing pops up */
      tl.to(els.peel, { x: 0, y: 0, scale: 1, duration: 0.8, ease: "power1.inOut" }, 8.5)
        .to(els.fire, { opacity: 0.5, duration: 0.6 }, 8.6)
        .to(els.steam, { opacity: 0.8, y: -10, duration: 0.6, stagger: 0.12 }, 9.1)
        .to(els.camera, { scale: 1, x: 0, y: 0, duration: 1.3, ease: "power2.inOut" }, 9.4)
        .to(els.photo, { opacity: 1, scale: 1, rotation: 0, y: 0, duration: 1.2, ease: "back.out(1.4)" }, 10.1)
        .to(els.steam, { opacity: 0, duration: 0.4 }, 10.3);
      cap(tl, 4, 10.4);
      tl.to({}, { duration: 0.6 }); // hold the final frame for a moment
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className="truck-scene" ref={root} aria-label={t("truckLabel")}>
      <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="ts-green" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1f5a3a" /><stop offset="1" stopColor="#143d28" />
          </linearGradient>
          <radialGradient id="ts-warm" cx="50%" cy="35%" r="75%">
            <stop offset="0" stopColor="#f6c271" /><stop offset=".55" stopColor="#8a4f1f" /><stop offset="1" stopColor="#2b170a" />
          </radialGradient>
          <linearGradient id="ts-stone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c9b496" /><stop offset="1" stopColor="#7e6b55" />
          </linearGradient>
          <radialGradient id="ts-fire" cx="50%" cy="80%" r="70%">
            <stop offset="0" stopColor="#ffe08a" /><stop offset=".45" stopColor="#ff8a2b" /><stop offset="1" stopColor="#ff5a1f" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ts-lamp" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffe6a8" stopOpacity=".9" /><stop offset="1" stopColor="#ffe6a8" stopOpacity="0" />
          </radialGradient>
          <clipPath id="ts-window"><rect x="60" y="96" width="220" height="130" rx="3" /></clipPath>
          <clipPath id="ts-mouth"><path d="M196 214V186q0-20 24-20t24 20v28z" /></clipPath>
        </defs>

        <g data-camera>
          {/* Route: Beirut → Malmö */}
          <g className="ts-route">
            <path d="M232 112Q600 18 968 112" fill="none" stroke="#f6f1e6" strokeOpacity=".45" strokeWidth="2" strokeDasharray="7 9" />
            <path data-route d="M232 112Q600 18 968 112" fill="none" stroke="#c29a4b" strokeWidth="3" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
            <g transform="translate(205 92)">
              <path d="M0 26C-14 12-18 4-18-4a18 18 0 0 1 36 0c0 8-4 16-18 30z" fill="#f6f1e6" />
              <clipPath id="ts-lb"><circle cx="0" cy="-4" r="13" /></clipPath>
              <g clipPath="url(#ts-lb)">
                <rect x="-13" y="-17" width="26" height="26" fill="#fff" />
                <rect x="-13" y="-17" width="26" height="6" fill="#c8102e" /><rect x="-13" y="3" width="26" height="6" fill="#c8102e" />
                <path d="M0-11l5 7h-2l4 6H-7l4-6h-2z" fill="#1f7a3e" />
              </g>
              <text x="0" y="-30" textAnchor="middle" className="ts-label">BEIRUT</text>
            </g>
            <g transform="translate(995 92)">
              <path d="M0 26C-14 12-18 4-18-4a18 18 0 0 1 36 0c0 8-4 16-18 30z" fill="#f6f1e6" />
              <clipPath id="ts-se"><circle cx="0" cy="-4" r="13" /></clipPath>
              <g clipPath="url(#ts-se)">
                <rect x="-13" y="-17" width="26" height="26" fill="#006aa7" />
                <rect x="-6" y="-17" width="5" height="26" fill="#fecc00" /><rect x="-13" y="-6.5" width="26" height="5" fill="#fecc00" />
              </g>
              <text x="0" y="-30" textAnchor="middle" className="ts-label">MALMÖ</text>
            </g>
          </g>

          {/* Far scenery: Raouché rocks and gulls left, Turning Torso and the bridge right */}
          <g data-far fill="none" stroke="#f6f1e6" strokeOpacity=".55" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
            <path d="M40 478c10-40 22-70 40-86 14-12 26-6 32 6 6-16 20-22 30-10 12 14 18 50 22 90" />
            <path d="M150 478c4-26 12-44 26-52 12-6 22 2 26 14 6 12 8 24 10 38" />
            <path d="M88 470c8-14 16-18 22-6M30 488h160M60 500h100" strokeOpacity=".35" />
            <path d="M210 230q8-8 16 0q8-8 16 0M250 200q6-6 12 0q6-6 12 0M180 260q5-5 10 0q5-5 10 0" strokeWidth="1.6" />
            <path d="M860 478V340M940 478V330M860 352l-60 126M860 352l60 126M940 340l-60 138M940 340l60 138M780 456h260" />
            <g transform="translate(1060 0)">
              <path d="M-18 478V250h36v228" />
              <path d="M-18 290h36M-18 330h36M-18 370h36M-18 410h36M-18 450h36M-10 250l20 40M-18 290l36 40M-18 330l36 40M-18 370l36 40M-18 410l36 40" strokeOpacity=".35" />
              <path d="M-6 250v-14h12v14" />
            </g>
          </g>

          {/* Road */}
          <path d="M0 478h1200" stroke="#f6f1e6" strokeOpacity=".7" strokeWidth="2" />
          <path d="M-20 540q300-40 700-46t540 24" fill="none" stroke="#f6f1e6" strokeOpacity=".25" strokeWidth="2" />
          <g data-dashes stroke="#f6f1e6" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round">
            {DASHES.map((x) => <line key={x} x1={x} y1="500" x2={x + 36} y2="500" />)}
          </g>

          {/* The truck */}
          <g transform="translate(330 150)">
            <g data-truck>
              <ellipse cx="280" cy="330" rx="275" ry="9" fill="#000" fillOpacity=".35" />
              <g data-body>
                <rect x="16" y="48" width="410" height="14" rx="7" fill="#1c4a32" />
                <rect x="20" y="58" width="400" height="232" rx="12" fill="url(#ts-green)" />
                <rect x="20" y="262" width="400" height="5" fill="#e9e1cf" fillOpacity=".75" />
                {/* Lebanese flag panel */}
                <rect x="296" y="84" width="108" height="168" rx="4" fill="#f3ecdc" />
                <path d="M296 84h108v30l-12 6-20-5-22 7-18-6-20 5-16-4z" fill="#c8102e" />
                <path d="M296 252h108v-30l-14-6-20 5-22-7-18 6-20-5-14 6z" fill="#c8102e" />
                <path d="M350 130l20 28h-9l17 24h-13l19 24h-68l19-24h-13l17-24h-9z" fill="#1f7a3e" />
                <rect x="346" y="206" width="8" height="10" fill="#6b4a2b" />
                {/* Serving window and kitchen */}
                <rect x="56" y="92" width="228" height="138" rx="6" fill="#0b1f15" />
                <g clipPath="url(#ts-window)">
                  <rect x="60" y="96" width="220" height="130" fill="#20140b" />
                  <rect data-warm x="60" y="96" width="220" height="130" fill="url(#ts-warm)" />
                  <rect x="72" y="104" width="46" height="22" rx="2" fill="#1d1a16" stroke="#8a6a3e" />
                  <path d="M77 111h28M77 116h34M77 121h22" stroke="#f6f1e6" strokeOpacity=".7" strokeWidth="1.4" />
                  <rect x="70" y="140" width="88" height="4" fill="#7a4f28" />
                  <rect x="76" y="128" width="8" height="12" rx="2" fill="#c9a36a" /><rect x="90" y="131" width="10" height="9" rx="2" fill="#b5552f" /><rect x="106" y="127" width="7" height="13" rx="2" fill="#d8c79f" /><rect x="120" y="130" width="12" height="10" rx="2" fill="#6f8b4a" />
                  {/* Stone oven */}
                  <path d="M168 220v-50q0-54 52-54t52 54v50z" fill="url(#ts-stone)" />
                  <path d="M180 150q40-30 80 0M174 176h18M248 176h20M176 200h16M250 200h18" fill="none" stroke="#6d5a45" strokeWidth="1.5" />
                  <path d="M196 214V186q0-20 24-20t24 20v28z" fill="#1a0d05" />
                  <g clipPath="url(#ts-mouth)">
                    <g data-fire>
                      <ellipse cx="220" cy="212" rx="30" ry="26" fill="url(#ts-fire)" />
                      <path className="ts-flame" d="M206 214q2-16 8-20q-1 10 5 12q2-12 9-16q-2 12 4 24z" fill="#ffb23f" />
                      <path className="ts-flame ts-flame--2" d="M214 214q3-10 7-13q1 7 6 9q0-6 4-8q0 8-2 12z" fill="#ffe08a" />
                    </g>
                  </g>
                  {/* Lamps */}
                  {[96, 140].map((x) => (
                    <g key={x}>
                      <line x1={x} y1="96" x2={x} y2="104" stroke="#2a2a26" strokeWidth="1.5" />
                      <path d={`M${x - 6} 110l3-6h6l3 6z`} fill="#2a2a26" />
                      <circle data-lamp cx={x} cy="114" r="14" fill="url(#ts-lamp)" />
                    </g>
                  ))}
                  <rect x="60" y="220" width="220" height="8" fill="#a8763e" />
                  {/* Peel with the dough */}
                  <g data-peel>
                    <rect x="20" y="214" width="66" height="5" rx="2" fill="#8a5a2e" />
                    <ellipse cx="120" cy="217" rx="34" ry="6" fill="#c48a4c" />
                    <ellipse data-dough cx="120" cy="212" rx="27" ry="6.5" fill="#f2e2bf" />
                    <g data-specks fill="#3d5a24">
                      {SPECKS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
                    </g>
                  </g>
                  <g data-steam fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round">
                    <path d="M110 200q-6-8 0-14t0-14" /><path d="M122 198q-6-8 0-14t0-14" /><path d="M134 200q-6-8 0-14t0-14" />
                  </g>
                </g>
                {/* Awning rods and the hatch (hinged at the top) */}
                <g data-rods stroke="#d9d2c2" strokeWidth="2.5"><line x1="64" y1="104" x2="64" y2="47" /><line x1="276" y1="104" x2="276" y2="47" /></g>
                <g data-hatch>
                  <rect x="56" y="92" width="228" height="138" rx="6" fill="url(#ts-green)" stroke="#0e2a1c" strokeWidth="2" />
                  <rect x="56" y="92" width="228" height="10" fill="#e9e1cf" fillOpacity=".75" />
                  <rect x="158" y="218" width="24" height="5" rx="2" fill="#d9d2c2" />
                </g>
                {/* Cab */}
                <circle cx="110" cy="290" r="42" fill="#0a1a12" />
                <circle cx="470" cy="290" r="42" fill="#0a1a12" />
                <path d="M420 108h58q20 0 28 18l26 70q6 16 6 32v62H420z" fill="url(#ts-green)" />
                <path d="M432 120h44q12 0 17 12l23 64h-84z" fill="#a9cfc8" fillOpacity=".85" />
                <path d="M446 128l-6 60M470 126l-10 62" stroke="#fff" strokeOpacity=".4" strokeWidth="3" />
                <path d="M428 120v164" stroke="#0e2a1c" strokeWidth="2" />
                <rect x="440" y="214" width="14" height="4" rx="2" fill="#d9d2c2" />
                <rect x="506" y="150" width="7" height="20" rx="2" fill="#0e2a1c" />
                {[444, 462, 480].map((x) => <rect key={x} x={x} y="102" width="10" height="6" rx="2" fill="#f0a63a" />)}
                <rect x="510" y="232" width="18" height="34" rx="3" fill="#0e2a1c" />
                <circle cx="531" cy="244" r="7" fill="#fff1c1" />
                <circle data-headlight cx="560" cy="248" r="34" fill="url(#ts-lamp)" />
                <rect x="414" y="280" width="134" height="12" rx="5" fill="#d8d2c4" />
              </g>
              <Wheel x={110} />
              <Wheel x={470} />
            </g>
          </g>
        </g>

        {/* The real thing pops up at the end */}
        <g data-photo>
          <ellipse cx="600" cy="232" rx="150" ry="22" fill="#000" fillOpacity=".35" />
          <image href="images/hero/zaatar-disc.webp" x="440" y="46" width="320" height="200" />
        </g>
      </svg>

      <div className="truck-scene__captions">
        {CAPTIONS.map((k, i) => (
          <p key={k} data-cap className={i === CAPTIONS.length - 1 ? "is-last" : undefined}>
            <span>{t(k)}</span>
            {i === CAPTIONS.length - 1 && <a href="#menu" className="btn btn--gold">{t("heroOrder")}</a>}
          </p>
        ))}
      </div>
    </section>
  );
}
