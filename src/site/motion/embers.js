// Golden embers and spice flecks rising from the manakish in a slow helix.
// Two canvases give depth: the far side of the swirl is drawn behind the dish, the near side in front.
function makeSprite(size) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,244,214,1)");
  g.addColorStop(0.25, "rgba(240,196,110,.85)");
  g.addColorStop(0.6, "rgba(214,140,60,.25)");
  g.addColorStop(1, "rgba(214,140,60,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  return c;
}

export default class Embers {
  constructor({ back, front, anchor, count = 60, ticker }) {
    this.back = back;
    this.front = front;
    this.anchor = anchor;
    this.ticker = ticker;
    this.intensity = 0; // 0 → 1 during the intro
    this.spread = 1;    // widened by scroll
    this.sprite = makeSprite(32);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.running = false;
    this.time = 0;
    this.parts = Array.from({ length: count }, (_, i) => ({
      u: i / count + Math.random() * 0.02,
      v: 0.05 + Math.random() * 0.03,
      j: (Math.random() - 0.5) * 0.5,
      d: (Math.random() - 0.5) * 0.16,
      s: 0.3 + Math.random() * 0.9,
      t: Math.random() * Math.PI * 2
    }));
    this.tick = this.tick.bind(this);
    this.resize();
  }

  resize() {
    [this.back, this.front].forEach((c) => {
      const r = c.getBoundingClientRect();
      c.width = Math.max(1, Math.round(r.width * this.dpr));
      c.height = Math.max(1, Math.round(r.height * this.dpr));
    });
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.ticker.add(this.tick);
  }

  stop() {
    this.running = false;
    this.ticker.remove(this.tick);
  }

  tick() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const bc = this.back.getContext("2d"), fc = this.front.getContext("2d");
    const W = this.back.width, H = this.back.height;
    bc.clearRect(0, 0, W, H);
    fc.clearRect(0, 0, W, H);
    if (this.intensity <= 0.001) return;

    const cr = this.back.getBoundingClientRect();
    const br = this.anchor.getBoundingClientRect();
    if (!cr.width) return;
    const k = W / cr.width;
    const cx = (br.left + br.width / 2 - cr.left) * k;
    const top = (br.top - br.height * 1.1 - cr.top) * k;
    const bottom = (br.top + br.height * 0.45 - cr.top) * k;
    const R = br.width * 0.42 * k * this.spread;
    bc.globalCompositeOperation = fc.globalCompositeOperation = "lighter";
    this.time += dt;

    for (const p of this.parts) {
      p.u += p.v * dt;
      if (p.u > 1) p.u -= 1;
      p.t += dt * 4;
      const u = p.u;
      const ang = u * Math.PI * 3.2 + this.time * 0.55 + p.j;
      const rad = R * (0.5 + u * 0.8) * (1 + p.d);
      const x = cx + Math.cos(ang) * rad;
      const y = bottom - (bottom - top) * (0.1 + u * 1.1) + Math.sin(ang) * rad * 0.3;
      const z = Math.sin(ang);
      const fade = Math.min(1, u * 8) * Math.min(1, (1 - u) * 2.5);
      const alpha = this.intensity * fade * (0.55 + 0.45 * Math.abs(Math.sin(p.t))) * (0.5 + 0.5 * (z + 1) / 2);
      if (alpha < 0.02) continue;
      const size = (3 + p.s * 9) * (0.6 + 0.4 * (z + 1) / 2) * this.dpr;
      const ctx = z < 0 ? bc : fc;
      ctx.globalAlpha = Math.min(1, alpha * 1.2);
      ctx.drawImage(this.sprite, x - size / 2, y - size / 2, size, size);
    }
    bc.globalAlpha = fc.globalAlpha = 1;
  }
}
