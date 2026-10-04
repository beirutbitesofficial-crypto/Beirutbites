import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Embers from "./embers.js";

// Cinematic hero: the arch opens, the manakish rises out of the dark and comes into focus,
// herbs scatter, embers start to swirl and steam rises. On scroll the dish is pinned and
// pulled to the centre (desktop) or gets a light parallax (phones).
export function useHeroMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const done = () => { root.classList.remove("cine-pending"); root.classList.add("motion-ready"); };
    const hero = document.querySelector("[data-hero]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hero || reduce) { done(); return undefined; }
    gsap.registerPlugin(ScrollTrigger);

    const $ = (s) => hero.querySelector(s);
    const $$ = (s) => [...hero.querySelectorAll(s)];
    const headerH = () => document.getElementById("topbar")?.offsetHeight || 0;
    let embers = null;
    const idle = [];
    let disposed = false;

    const ctx = gsap.context(() => {
      const els = {
        copy: $("[data-hero-copy]"),
        lines: $$("[data-hero-title] .tline__in"),
        copyBits: $$("[data-hero-copy] > [data-cine]"),
        visual: $("[data-hero-visual]"),
        stage: $("[data-stage]"),
        arch: $("[data-arch]"),
        backdrop: $(".stage__backdrop"),
        dish: $("[data-dish]"),
        dishFloat: $("[data-dish] .dish__float"),
        left: $('[data-side="left"]'),
        right: $('[data-side="right"]'),
        sideFloats: $$("[data-side] .dish__float"),
        steam: $("[data-steam]"),
        herbsGroup: $("[data-herbs]"),
        herbs: $$("[data-herb]"),
        ticket: $("[data-ticket]"),
        meta: $("[data-hero-meta]"),
        metaItems: $$("[data-hero-meta] > div"),
        glow: $("[data-glow]"),
        aura: $("[data-aura]")
      };

      const small = window.matchMedia("(max-width: 720px)").matches;
      const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || navigator.connection?.saveData;
      embers = new Embers({
        back: $('[data-sparks="back"]'),
        front: $('[data-sparks="front"]'),
        anchor: els.dish,
        count: small || lowPower ? 50 : 110,
        ticker: gsap.ticker
      });
      const setLive = (on) => {
        idle.forEach((tw) => (on ? tw.resume() : tw.pause()));
        if (embers) (on && !document.hidden ? embers.start() : embers.stop());
      };
      ScrollTrigger.create({ trigger: hero, start: "top bottom", end: "bottom top", onToggle: (self) => setLive(self.isActive) });
      const onVis = () => setLive(!document.hidden && ScrollTrigger.isInViewport(hero));
      document.addEventListener("visibilitychange", onVis);

      /* 1. Intro */
      const box = els.stage.getBoundingClientRect();
      const dishBox = els.dish.getBoundingClientRect();
      const origin = { x: dishBox.left + dishBox.width / 2, y: dishBox.top + dishBox.height / 2 };
      gsap.set([els.glow, els.aura], { opacity: 0 });
      gsap.set(els.arch, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(els.backdrop, { scale: 1.25 });
      gsap.set(els.steam, { opacity: 0 });
      gsap.set(els.dish, { y: box.height * 0.16 });
      gsap.set(els.dishFloat, { opacity: 0, scale: 0.82, rotation: -18, filter: "blur(10px)" });
      gsap.set(els.left, { x: -box.width * 0.08 });
      gsap.set(els.right, { x: box.width * 0.08 });
      gsap.set(els.sideFloats, { opacity: 0, scale: 0.92 });
      els.herbs.forEach((h) => {
        const r = h.getBoundingClientRect();
        gsap.set(h, { x: origin.x - (r.left + r.width / 2), y: origin.y - (r.top + r.height / 2), scale: 0, rotation: 0, opacity: 0 });
      });
      gsap.set(els.lines, { yPercent: 112 });
      gsap.set(els.copyBits, { opacity: 0, y: 26 });
      gsap.set(els.ticket, { clipPath: "inset(0% 0% 0% 100%)", x: 24 });
      gsap.set(els.metaItems, { opacity: 0, y: 18 });
      done();

      const S = { v: 0 };
      gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: startIdle })
        .to([els.glow, els.aura], { opacity: 1, duration: 2.4, ease: "sine.out" }, 0)
        .to(els.arch, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" }, 0)
        .to(els.backdrop, { scale: 1.05, duration: 2.6, ease: "power2.out" }, 0.2)
        .to(els.dish, { y: 0, duration: 1.9, ease: "expo.out" }, 0.35)
        .to(els.dishFloat, { opacity: 1, scale: 1, rotation: 0, filter: "blur(0px)", duration: 1.8, ease: "power2.out" }, 0.35)
        .to([els.left, els.right], { x: 0, duration: 1.8, ease: "expo.out" }, 0.8)
        .to(els.sideFloats, { opacity: 1, scale: 1, duration: 1.4, stagger: 0.12 }, 0.8)
        .to(els.herbs, {
          x: 0, y: 0, opacity: 1, duration: 2, ease: "expo.out",
          scale: (i) => parseFloat(els.herbs[i].style.getPropertyValue("--s")) || 1,
          rotation: (i) => parseFloat(els.herbs[i].style.getPropertyValue("--r")) || 0,
          stagger: { each: 0.07, from: "random" }
        }, 1.2)
        .to(els.steam, { opacity: 1, duration: 2, ease: "sine.out" }, 1.4)
        .to(S, { v: 1, duration: 2.2, ease: "sine.inOut", onUpdate: () => { if (embers) embers.intensity = S.v; } }, 1.1)
        .to(els.copyBits[0], { opacity: 1, y: 0, duration: 1 }, 0.9)
        .to(els.lines, { yPercent: 0, duration: 1.5, ease: "expo.out", stagger: 0.12 }, 1.0)
        .to(els.copyBits.slice(1), { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 }, 1.55)
        .to(els.ticket, { clipPath: "inset(0% 0% 0% 0%)", x: 0, duration: 1.3, ease: "expo.inOut" }, 2.0)
        .to(els.metaItems, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 2.2);

      /* 2. Idle life */
      function startIdle() {
        if (disposed) return;
        const sine = { ease: "sine.inOut", yoyo: true, repeat: -1 };
        idle.push(
          gsap.to(els.dishFloat, { y: -8, rotation: 1.5, duration: 3.6, ...sine }),
          gsap.to(els.sideFloats[0], { y: -6, duration: 4.1, delay: 0.6, ...sine }),
          gsap.to(els.sideFloats[1], { y: -5, duration: 3.8, delay: 1.1, ...sine }),
          gsap.to(els.glow, { scale: 1.08, opacity: 0.75, duration: 9, ...sine })
        );
        els.herbs.forEach((h, i) => {
          idle.push(gsap.to(h, {
            yPercent: gsap.utils.random(-60, 60), xPercent: gsap.utils.random(-40, 40),
            rotation: `+=${gsap.utils.random(-30, 30)}`, duration: gsap.utils.random(4.5, 7.5), delay: i * 0.2, ...sine
          }));
        });
        if (!ScrollTrigger.isInViewport(hero)) setLive(false);
      }

      /* 3. Scroll choreography */
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1025px)", () => {
        const toCenter = () => {
          const r = els.visual.getBoundingClientRect();
          const current = gsap.getProperty(els.visual, "x");
          return window.innerWidth / 2 - (r.left - current + r.width / 2);
        };
        const SP = { v: 1 };
        gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: hero, start: () => `top top+=${headerH()}`, end: "+=70%", pin: true, scrub: 0.9, invalidateOnRefresh: true, anticipatePin: 1 }
        })
          .to(els.copy, { y: -90, opacity: 0, duration: 0.55, ease: "power1.in" }, 0)
          .to(els.meta, { y: 40, opacity: 0, duration: 0.4 }, 0)
          .to(els.ticket, { opacity: 0, y: 30, duration: 0.35 }, 0)
          .to(els.visual, { x: toCenter, duration: 1, ease: "power2.inOut" }, 0)
          .to(els.dish, { scale: 1.22, yPercent: -6, rotation: 8, duration: 1, ease: "power1.inOut" }, 0)
          .to(els.left, { xPercent: -60, scale: 0.9, opacity: 0.4, duration: 1 }, 0)
          .to(els.right, { xPercent: 60, scale: 0.9, opacity: 0.4, duration: 1 }, 0)
          .to(els.arch, { scale: 1.07, duration: 1 }, 0)
          .to(els.backdrop, { yPercent: 8, duration: 1 }, 0)
          .to(els.herbsGroup, { scale: 1.35, yPercent: -10, duration: 1 }, 0)
          .to([els.glow, els.aura], { scale: 1.3, duration: 1 }, 0)
          .to(SP, { v: 1.6, duration: 1, onUpdate: () => { if (embers) embers.spread = SP.v; } }, 0);
        return () => { if (embers) embers.spread = 1; };
      });
      mm.add("(max-width: 1024px)", () => {
        gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 } })
          .to(els.dish, { yPercent: -10, scale: 1.08, rotation: 6, duration: 1 }, 0)
          .to(els.left, { xPercent: -18, duration: 1 }, 0)
          .to(els.right, { xPercent: 18, duration: 1 }, 0)
          .to(els.herbsGroup, { yPercent: -16, duration: 1 }, 0)
          .to(els.backdrop, { yPercent: 10, duration: 1 }, 0);
      });

      /* 4. Parallax outside the hero */
      gsap.utils.toArray("[data-parallax]").forEach((m) => {
        gsap.fromTo(m, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: m.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });
      const mark = document.querySelector("[data-story-mark]");
      if (mark) gsap.fromTo(mark, { yPercent: 18 }, { yPercent: -18, ease: "none", scrollTrigger: { trigger: mark.parentElement, start: "top bottom", end: "bottom top", scrub: true } });

      embers.resize();
      setLive(true);
      return () => document.removeEventListener("visibilitychange", onVis);
    });

    // Content below the hero changes height (menu filters, language) — keep scroll positions right.
    let rt;
    const refresh = () => { clearTimeout(rt); rt = setTimeout(() => { if (embers) embers.resize(); ScrollTrigger.refresh(); }, 200); };
    const ro = new ResizeObserver(refresh);
    ro.observe(document.body);
    window.addEventListener("load", refresh);

    return () => {
      disposed = true;
      clearTimeout(rt);
      ro.disconnect();
      window.removeEventListener("load", refresh);
      if (embers) embers.stop();
      ctx.revert();
    };
  }, []);
}
