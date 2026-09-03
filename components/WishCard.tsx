"use client";

import { useState } from "react";
import MoodSeal from "./MoodSeal";
import WarmButton from "./WarmButton";
import type { Mood } from "@/lib/mood";

export default function WishCard({
  body,
  label,
  mood,
  wishId,
  warmCount = 0,
  className = "",
}: {
  body: string;
  label: string;
  mood: Mood;
  wishId?: string;
  warmCount?: number;
  className?: string;
}) {
  const [reported, setReported] = useState(false);
  const [busy, setBusy] = useState(false);

  async function report() {
    if (!wishId || busy || reported) return;
    setBusy(true);
    try {
      await fetch(`/api/wishes/${wishId}/report`, { method: "POST" });
      setReported(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`parchment relative overflow-hidden rounded-[14px] p-6 ${className}`}>
      <div className="absolute right-4 top-4">
        <MoodSeal mood={mood} />
      </div>

      <p className="mt-2 max-w-[90%] font-hand text-2xl leading-snug whitespace-pre-wrap break-words">
        {body}
      </p>
      <p className="mt-4 font-hand text-lg text-[#7a5c33]">— {label}</p>

      {wishId && (
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#d8cba8] pt-4">
          <WarmButton wishId={wishId} initialCount={warmCount} />
          <button
            onClick={report}
            disabled={busy || reported}
            className="shrink-0 text-[11px] uppercase tracking-wide text-[#9a8f7a] hover:text-[#b23b3b] disabled:opacity-60"
          >
            {reported ? "reported" : "report"}
          </button>
        </div>
      )}
    </div>
  );
}
