"use client";

import { useState } from "react";
import WishCard from "./WishCard";

import type { Mood } from "@/lib/mood";

type Result = {
  id: string;
  body: string;
  first_name: string;
  last_name: string;
  mood: Mood;
  warm_count: number;
};

export default function NameSearch() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/wishes/search?first=${encodeURIComponent(first)}&last=${encodeURIComponent(last)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Search failed.");
        setResults(null);
        return;
      }
      setResults(data.wishes);
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 text-white">
      <form onSubmit={submit} className="flex flex-wrap gap-3">
        <input
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          required
          placeholder="First name"
          className="min-w-[8rem] flex-1 rounded-xl border border-white/20 bg-white/5 p-3 outline-none placeholder:text-white/40 focus:border-white/50"
        />
        <input
          value={last}
          onChange={(e) => setLast(e.target.value)}
          required
          placeholder="Surname"
          className="min-w-[8rem] flex-1 rounded-xl border border-white/20 bg-white/5 p-3 outline-none placeholder:text-white/40 focus:border-white/50"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-white px-5 py-3 font-medium text-[#0a1230] disabled:opacity-60"
        >
          {busy ? "…" : "Search"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

      {results && (
        <div className="mt-8 space-y-4">
          {results.length === 0 ? (
            <p className="font-hand text-2xl text-white/70">No wishes found under that name yet.</p>
          ) : (
            results.map((r) => (
              <WishCard
                key={r.id}
                body={r.body}
                label={`${r.first_name} ${r.last_name}`}
                mood={r.mood}
                warmCount={r.warm_count}
                wishId={r.id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
