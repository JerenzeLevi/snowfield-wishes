"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FIELD } from "@/lib/field";
import WishCard from "./WishCard";

type FieldWish = {
  id: string;
  body: string;
  alias: string;
  x: number;
  y: number;
  created_at: string;
};

const MAX_WISHES = 400;

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

  const applyTransform = useCallback(() => {
    if (planeRef.current) {
      planeRef.current.style.transform = `translate(${offset.current.x}px, ${offset.current.y}px)`;
    }
  }, []);

  const centerOn = useCallback(
    (x: number, y: number) => {
      const vp = viewportRef.current;
      if (!vp) return;
      offset.current = {
        x: vp.clientWidth / 2 - x,
        y: vp.clientHeight / 2 - y,
      };
      clampOffset();
      applyTransform();
    },
    [applyTransform],
  );

  const clampOffset = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const minX = vp.clientWidth - FIELD.width;
    const minY = vp.clientHeight - FIELD.height;
    offset.current.x = Math.min(0, Math.max(minX, offset.current.x));
    offset.current.y = Math.min(0, Math.max(minY, offset.current.y));
  }, []);

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
      <div
        ref={planeRef}
        className="absolute left-0 top-0 will-change-transform"
        style={{ width: FIELD.width, height: FIELD.height }}
      >
        {wishes.map((w) => {
          const rot = ((hashInt(w.id) % 16) - 8);
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
              }}
            >
              <p className="font-hand text-[15px] leading-tight line-clamp-4 break-words">{w.body}</p>
              <span className="mt-2 block font-hand text-sm text-[#7a5c33]">— {w.alias}</span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-white/60 font-hand text-2xl">
          gathering wishes from the snow…
        </div>
      )}

      {!loading && wishes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center text-white/70 font-hand text-2xl">
          The field is untouched. Be the first to leave a wish.
        </div>
      )}

      <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-xs text-white/40">
        drag to wander · arrow keys to drift · click a note to read
      </p>

      {open && (
        <div
          className="fixed inset-0 z-30 grid place-items-center bg-black/60 p-6 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <WishCard body={open.body} label={open.alias} wishId={open.id} />
            <button
              onClick={() => setOpen(null)}
              className="mx-auto mt-4 block text-sm text-white/70 hover:text-white"
            >
              close
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
