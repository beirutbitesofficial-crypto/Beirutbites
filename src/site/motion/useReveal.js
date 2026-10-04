import { useEffect } from "react";

// Scroll reveals for everything below the hero: fades, masked words, curtain cards, counting stats
// and the footer signature that fills with gold and lights up like a neon sign.
// (The curtain cards are observed through their grid: an element hidden by its own clip-path never "intersects".)
const SELECTOR = ".reveal, .reveal-words, .cats, [data-stats], [data-giant]";

function countUp(stats) {
  stats.querySelectorAll("strong[data-count]").forEach((el, i) => {
    const target = parseInt(el.getAttribute("data-count"), 10);
    if (!target) return;
    const start = performance.now() + i * 120;
    const step = (now) => {
      const p = Math.min(1, Math.max(0, (now - start) / 1800));
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = el.getAttribute("data-count");
    };
    requestAnimationFrame(step);
  });
}

function lightUp(word) {
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / 1800);
    const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    word.style.setProperty("--fill", `${(eased * 100).toFixed(1)}%`);
    if (p > 0.86) word.classList.add("is-lit");
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function useReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      root.classList.remove("motion");
      document.querySelectorAll("[data-giant]").forEach((w) => w.classList.add("is-lit"));
      return undefined;
    }
    root.classList.add("motion");
    const seen = new WeakSet();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        io.unobserve(el);
        if (el.hasAttribute("data-giant")) { lightUp(el); return; }
        el.classList.add("is-in");
        if (el.hasAttribute("data-stats")) countUp(el);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });

    const scan = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
}
