"use client";

import { useEffect, useRef, useState } from "react";

const KEY = "warmed-wishes";

function alreadyWarmed(id: string): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]).includes(id) : false;
  } catch {
    return false;
  }
}
function remember(id: string) {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    if (!list.includes(id)) list.push(id);
    localStorage.setItem(KEY, JSON.stringify(list.slice(-500)));
  } catch {
    /* ignore */
  }
}

export default function WarmButton({
  wishId,
  initialCount,
}: {
  wishId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [warmed, setWarmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [embers, setEmbers] = useState<number[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWarmed(alreadyWarmed(wishId));
  }, [wishId]);

  async function warm() {
    if (warmed || busy) return;
    setBusy(true);
    setWarmed(true);
    setCount((c) => c + 1);
    remember(wishId);

    const ids = Array.from({ length: 6 }, (_, i) => Date.now() + i);
    setEmbers((e) => [...e, ...ids]);
    setTimeout(() => setEmbers((e) => e.filter((id) => !ids.includes(id))), 1100);

    try {
      const res = await fetch(`/api/wishes/${wishId}/warm`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.warm_count === "number") setCount(data.warm_count);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative inline-flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={warm}
        disabled={warmed}
        aria-label="Warm this wish"
        className={`grid size-11 place-items-center rounded-full border text-xl transition ${
          warmed
            ? "border-amber-300/60 bg-amber-100/70"
            : "border-[#c9b48a] bg-[#f0e7d0] hover:bg-[#f6efdc] hover:scale-105"
        }`}
      >
        <span aria-hidden>{warmed ? "☕" : "☕"}</span>
      </button>
      <span className="text-center text-[11px] leading-tight text-[#6f6142]">
        {count === 0
          ? "be the first to warm this"
          : `Warmed by ${count} wandering ${count === 1 ? "stranger" : "strangers"}`}
      </span>

      {embers.map((id, i) => (
        <span
          key={id}
          className="ember"
          style={{ ["--dx" as string]: `${(i - 3) * 9}px`, animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}
