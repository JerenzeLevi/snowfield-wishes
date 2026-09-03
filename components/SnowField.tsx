"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FIELD } from "@/lib/field";
import WishCard from "./WishCard";
import Snow from "./Snow";
import MoodSeal from "./MoodSeal";
import { moodMap, type Mood } from "@/lib/mood";

type FieldWish = {
  id: string;
  body: string;
  alias: string;
  mood: Mood;
  warm_count: number;
  x: number;
  y: number;
  created_at: string;
};

const MAX_WISHES = 400;
const TRAIL_MS = 15000;

export default function SnowField() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");

  const [wishes, setWishes] = useState<FieldWish[]>([]);
  const [open, setOpen] = useState<FieldWish | null>(null);
  const [loading, setLoading] = useState(true);

  const viewportRef = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });
  const planeRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startY: number; ox: number; oy: number; moved: boolean } | null>(
    null,
  );

  // footprint trail (world coordinates)
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  const trail = useRef<{ x: number; y: number; born: number }[]>([]);
  const lastTrail = useRef<{ x: number; y: number } | null>(null);

  const applyTransform = useCallback(() => {
    if (planeRef.current) {
      planeRef.current.style.transform = `translate(${offset.current.x}px, ${offset.current.y}px)`;
    }
  }, []);

  const clampOffset = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const minX = vp.clientWidth - FIELD.width;
    const minY = vp.clientHeight - FIELD.height;
    offset.current.x = Math.min(0, Math.max(minX, offset.current.x));
    offset.current.y = Math.min(0, Math.max(minY, offset.current.y));
  }, []);

  const centerOn = useCallback(
    (x: number, y: number) => {
      const vp = viewportRef.current;
      if (!vp) return;
      offset.current = { x: vp.clientWidth / 2 - x, y: vp.clientHeight / 2 - y };
      clampOffset();
      applyTransform();
    },
    [applyTransform, clampOffset],
  );

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      let cursor: string | null = null;
      const acc: FieldWish[] = [];
      for (let i = 0; i < 10; i++) {
        const url: string = cursor
          ? `/api/wishes/field?cursor=${encodeURIComponent(cursor)}`
          : "/api/wishes/field";
        const res = await fetch(url);
        if (!res.ok) break;
        const data: { wishes: FieldWish[]; nextCursor: string | null } = await res.json();
        acc.push(...data.wishes);
        cursor = data.nextCursor;
        if (!cursor || acc.length >= MAX_WISHES) break;
      }
      if (cancelled) return;
      setWishes(acc);
      setLoading(false);

      requestAnimationFrame(() => {
        const target = focusId ? acc.find((w) => w.id === focusId) : null;
        if (target) centerOn(target.x, target.y);
        else if (acc.length > 0) {
          const cx = acc.reduce((s, w) => s + w.x, 0) / acc.length;
          const cy = acc.reduce((s, w) => s + w.y, 0) / acc.length;
          centerOn(cx, cy);
        } else centerOn(FIELD.width / 2, FIELD.height / 2);
      });
    }
    loadAll();
    return () => {
      cancelled = true;
    };
  }, [focusId, centerOn]);

  // ---- footprint trail rendering ----
  useEffect(() => {
    const canvasEl = trailCanvasRef.current;
    const vpEl = viewportRef.current;
    if (!canvasEl || !vpEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    const cv = canvasEl;
    const vp = vpEl;
    const c = ctx;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let dpr = 1;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = vp.clientWidth * dpr;
      cv.height = vp.clientHeight * dpr;
      cv.style.width = `${vp.clientWidth}px`;
      cv.style.height = `${vp.clientHeight}px`;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener("resize", size);

    let raf = 0;
    function frame() {
      const now = performance.now();
      const pts = trail.current;
      while (pts.length && now - pts[0].born > TRAIL_MS) pts.shift();
      c.clearRect(0, 0, cv.width, cv.height);
      for (const p of pts) {
        const age = (now - p.born) / TRAIL_MS;
        const a = (1 - age) * 0.4;
        const sx = p.x + offset.current.x;
        const sy = p.y + offset.current.y;
        const r = 22 + age * 10;
        const g = c.createRadialGradient(sx, sy, 0, sx, sy, r);
        g.addColorStop(0, `rgba(210,225,235,${a})`);
        g.addColorStop(1, "rgba(210,225,235,0)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(sx, sy, r, 0, Math.PI * 2);
        c.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, []);

  // pointer panning
  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      ox: offset.current.x,
      oy: offset.current.y,
      moved: false,
    };
    lastTrail.current = null;
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    offset.current = { x: d.ox + dx, y: d.oy + dy };
    clampOffset();
    applyTransform();

    // drop footprints along the drag, in world space
    const vp = viewportRef.current;
    if (vp) {
      const rect = vp.getBoundingClientRect();
      const wx = e.clientX - rect.left - offset.current.x;
      const wy = e.clientY - rect.top - offset.current.y;
      const l = lastTrail.current;
      if (!l || Math.hypot(wx - l.x, wy - l.y) > 26) {
        trail.current.push({ x: wx, y: wy, born: performance.now() });
        if (trail.current.length > 400) trail.current.shift();
        lastTrail.current = { x: wx, y: wy };
      }
    }
  }
  function onPointerUp() {
    drag.current = null;
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
      const step = 120;
      if (e.key === "ArrowLeft") offset.current.x += step;
      else if (e.key === "ArrowRight") offset.current.x -= step;
      else if (e.key === "ArrowUp") offset.current.y += step;
      else if (e.key === "ArrowDown") offset.current.y -= step;
      else return;
      clampOffset();
      applyTransform();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyTransform, clampOffset]);

  return (
    <div
      ref={viewportRef}
      className="relative z-10 flex-1 overflow-hidden touch-none cursor-grab active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <canvas ref={trailCanvasRef} aria-hidden className="pointer-events-none absolute inset-0 z-[5]" />

      <div
        ref={planeRef}
        className="absolute left-0 top-0 z-[6] will-change-transform"
        style={{ width: FIELD.width, height: FIELD.height }}
      >
        {wishes.map((w) => {
          const rot = (hashInt(w.id) % 31) / 10 - 1.5; // -1.5deg .. +1.5deg
          return (
            <button
              key={w.id}
              onClick={() => {
                if (!drag.current?.moved) setOpen(w);
              }}
              className="note-paper absolute w-40 rounded-[10px] p-3 text-left transition-transform hover:z-10 hover:scale-[1.06]"
              style={{
                left: w.x,
                top: w.y,
                transform: `translate(-50%, -50%) rotate(${rot}deg)`,
                borderBottom: `3px solid ${moodMap[w.mood].seal}`,
              }}
            >
              <span className="absolute -right-2 -top-2">
                <MoodSeal mood={w.mood} size={18} title={false} />
              </span>
              <p className="font-hand text-[15px] leading-tight line-clamp-4 break-words">{w.body}</p>
              <span className="mt-2 flex items-center justify-between font-hand text-sm text-[#7a5c33]">
                <span className="truncate">— {w.alias}</span>
                {w.warm_count > 0 && (
                  <span className="ml-1 shrink-0 text-[11px] text-[#8a6b3d]">
                    ☕ {w.warm_count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center text-white/60 font-hand text-2xl">
          gathering wishes from the snow…
        </div>
      )}

      {!loading && wishes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center px-6 text-center text-white/70 font-hand text-2xl">
          The field is untouched. Be the first to leave a wish.
        </div>
      )}

      <div className="pointer-events-none absolute bottom-4 left-0 right-0 z-10 flex justify-center">
        <span className="rounded-full bg-black/30 px-3 py-1 text-xs text-slate-300 backdrop-blur-sm">
          drag to wander · arrow keys to drift · click a note to read
        </span>
      </div>

      <Snow front />

      {open && (
        <div
          className="veil-in fixed inset-0 z-30 grid place-items-center bg-black/65 p-6 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <WishCard
              body={open.body}
              label={open.alias}
              mood={open.mood}
              warmCount={open.warm_count}
              wishId={open.id}
              className="unfolding"
            />
            <button
              onClick={() => setOpen(null)}
              className="mx-auto mt-4 block text-sm text-white/70 hover:text-white"
            >
              fold away
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function hashInt(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
