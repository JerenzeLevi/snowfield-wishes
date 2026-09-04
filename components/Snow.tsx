"use client";

import { useEffect, useRef } from "react";

type Flake = {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  phase: number;
  glyph: string | null;
};

type LayerSpec = {
  density: number; // flakes per 100k px²
  rMin: number;
  rMax: number;
  speedMin: number;
  speedMax: number;
  driftMin: number;
  driftMax: number;
  alpha: number;
  parallax: number; // how much the mouse nudges this layer
  glyphChance: number;
};

const LAYERS: LayerSpec[] = [
  // background blizzard — fine, fast, faint
  { density: 26, rMin: 0.5, rMax: 1.6, speedMin: 40, speedMax: 70, driftMin: 4, driftMax: 10, alpha: 0.5, parallax: 4, glyphChance: 0 },
  // midground — crisp, medium
  { density: 12, rMin: 1.8, rMax: 4.5, speedMin: 22, speedMax: 42, driftMin: 8, driftMax: 18, alpha: 0.85, parallax: 14, glyphChance: 0 },
  // foreground hero — big, soft, slow flutter, some crystalline glyphs
  { density: 3.4, rMin: 6, rMax: 14, speedMin: 12, speedMax: 26, driftMin: 16, driftMax: 34, alpha: 0.95, parallax: 30, glyphChance: 0.4 },
];

const GLYPHS = ["❄", "❅", "❆", "✳"];

// a sparse blur-heavy layer of big flakes rendered ABOVE the notes for depth
const FRONT_LAYER: LayerSpec = {
  density: 2.2,
  rMin: 9,
  rMax: 20,
  speedMin: 10,
  speedMax: 22,
  driftMin: 18,
  driftMax: 40,
  alpha: 0.62,
  parallax: 46,
  glyphChance: 0.35, // some drift across as crystalline snowflakes
};

export default function Snow({ front = false }: { front?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const activeLayers = front ? [FRONT_LAYER] : LAYERS;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cv: HTMLCanvasElement = canvas;
    const c: CanvasRenderingContext2D = ctx;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let layers: Flake[][] = [];
    const mouse = { x: 0.5, tx: 0.5 }; // normalised -1..1 handled below

    function makeFlake(spec: LayerSpec): Flake {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: spec.rMin + Math.random() * (spec.rMax - spec.rMin),
        speed: spec.speedMin + Math.random() * (spec.speedMax - spec.speedMin),
        drift: spec.driftMin + Math.random() * (spec.driftMax - spec.driftMin),
        phase: Math.random() * Math.PI * 2,
        glyph: Math.random() < spec.glyphChance ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : null,
      };
    }

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const area = w * h;
      layers = activeLayers.map((spec) => {
        const count = Math.max(6, Math.round((area / 100000) * spec.density));
        return Array.from({ length: reduced ? Math.round(count * 0.4) : count }, () =>
          makeFlake(spec),
        );
      });
    }

    function draw(dt: number) {
      c.clearRect(0, 0, w, h);
      c.filter = front ? "blur(3px)" : "none";
      const mx = (mouse.x - 0.5) * 2; // -1..1
      for (let li = 0; li < activeLayers.length; li++) {
        const spec = activeLayers[li];
        const flakes = layers[li];
        const offset = -mx * spec.parallax;
        c.fillStyle = `rgba(255,255,255,${spec.alpha})`;
        for (let i = 0; i < flakes.length; i++) {
          const f = flakes[i];
          if (!reduced) {
            f.y += f.speed * dt;
            f.phase += dt * 1.1;
            f.x += Math.sin(f.phase) * f.drift * dt;
          }
          if (f.y - f.r > h) {
            f.y = -f.r;
            f.x = Math.random() * w;
          }
          let x = f.x + offset;
          if (x < -20) x += w + 40;
          else if (x > w + 20) x -= w + 40;

          if (f.glyph) {
            c.font = `${f.r * 2}px serif`;
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText(f.glyph, x, f.y);
          } else {
            c.beginPath();
            c.arc(x, f.y, f.r, 0, Math.PI * 2);
            c.fill();
          }
        }
      }
    }

    build();

    let raf = 0;
    let last = performance.now();
    function loop(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      draw(dt);
      raf = requestAnimationFrame(loop);
    }

    if (reduced) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    function onMove(e: MouseEvent) {
      mouse.tx = e.clientX / window.innerWidth;
    }
    function onResize() {
      build();
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, [front]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={
        front
          ? "pointer-events-none fixed inset-0 z-20"
          : "pointer-events-none fixed inset-0 z-0"
      }
    />
  );
}
