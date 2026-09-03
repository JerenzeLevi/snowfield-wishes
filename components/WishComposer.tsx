"use client";

import { useState } from "react";
import Link from "next/link";
import { MOODS, type Mood } from "@/lib/mood";

export default function WishComposer() {
  const [body, setBody] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [alias, setAlias] = useState("");
  const [mood, setMood] = useState<Mood>("gratitude");
  const [searchable, setSearchable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { id: string; searchable: boolean }>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body, firstName, lastName, alias, mood, searchable }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDone({ id: data.wish.id, searchable });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mt-8 rounded-2xl border border-amber-100/15 bg-amber-50/[0.04] p-6 text-white">
        <p className="font-hand text-2xl">Your wish is in the snow.</p>
        <p className="mt-1 text-sm text-white/70">
          It drifts on the field signed <span className="font-hand text-amber-100">{alias}</span>.
          {done.searchable
            ? " Anyone who searches your name will find it too."
            : " Your real name stays private — only the alias shows."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/?focus=${done.id}`}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#04121a]"
          >
            Find it in the field
          </Link>
          <button
            onClick={() => {
              setDone(null);
              setBody("");
            }}
            className="rounded-full border border-white/25 px-4 py-2 text-sm"
          >
            Another wish
          </button>
        </div>
      </div>
    );
  }

  const bodyLeft = 500 - body.length;

  return (
    <form onSubmit={submit} className="mt-8 space-y-5 text-white">
      <div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, 500))}
          required
          rows={4}
          placeholder="I wish for…"
          className="w-full resize-none rounded-xl border border-white/20 bg-white/5 p-4 font-hand text-xl outline-none placeholder:text-white/40 focus:border-amber-100/50"
        />
        <div className="mt-1 text-right text-xs text-white/40">{bodyLeft} left</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value.slice(0, 60))}
          required
          placeholder="First name"
          className="rounded-xl border border-white/20 bg-white/5 p-3 outline-none placeholder:text-white/40 focus:border-amber-100/50"
        />
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value.slice(0, 60))}
          required
          placeholder="Surname"
          className="rounded-xl border border-white/20 bg-white/5 p-3 outline-none placeholder:text-white/40 focus:border-amber-100/50"
        />
      </div>

      <label className="block">
        <span className="text-xs uppercase tracking-wide text-white/50">Sign the note with</span>
        <input
          value={alias}
          onChange={(e) => setAlias(e.target.value.slice(0, 40))}
          required
          placeholder="an alias / pen name"
          className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 p-3 outline-none placeholder:text-white/40 focus:border-amber-100/50"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-xs uppercase tracking-wide text-white/50">
          The heart of this wish
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {MOODS.map((m) => {
            const active = mood === m.key;
            return (
              <button
                type="button"
                key={m.key}
                onClick={() => setMood(m.key)}
                className={`rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-white/60 bg-white/10"
                    : "border-white/15 bg-white/5 hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block size-3 rounded-full"
                    style={{ background: m.seal }}
                  />
                  <span className="text-sm font-medium">{m.label}</span>
                </span>
                <span className="mt-1 block text-xs text-white/45">{m.blurb}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-3 text-sm">
        <input
          type="checkbox"
          checked={searchable}
          onChange={(e) => setSearchable(e.target.checked)}
          className="mt-0.5 size-4 accent-amber-200"
        />
        <span className="text-white/80">
          Let people find this wish by searching my name.
          <span className="block text-xs text-white/45">
            {searchable
              ? "Someone who knows your name can look it up. The field still only shows your alias."
              : "Off — the wish drifts on the field under your alias only, and your name is not searchable."}
          </span>
        </span>
      </label>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-white py-3 font-medium text-[#04121a] disabled:opacity-60"
      >
        {busy ? "sending…" : "Send my wish"}
      </button>
    </form>
  );
}
