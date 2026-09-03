"use client";

import { useState } from "react";

export default function WishCard({
  body,
  label,
  wishId,
  className = "",
}: {
  body: string;
  label: string;
  wishId?: string;
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
    <div className={`note-paper relative overflow-visible rounded-[14px] p-5 ${className}`}>
      <p className="font-hand text-xl leading-snug whitespace-pre-wrap break-words">{body}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <span className="font-hand text-lg text-[#7a5c33]">— {label}</span>
        {wishId && (
          <button
            onClick={report}
            disabled={busy || reported}
            className="shrink-0 text-[11px] uppercase tracking-wide text-[#9a8f7a] hover:text-[#b23b3b] disabled:opacity-60"
          >
            {reported ? "reported" : "report"}
          </button>
        )}
      </div>
    </div>
  );
}
