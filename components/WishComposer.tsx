"use client";

import { useState } from "react";
import Link from "next/link";

type Mode = "alias" | "named";

export default function WishComposer() {
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<Mode>("alias");
  const [alias, setAlias] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { mode: Mode; id: string }>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          body,
          visibility: mode,
          alias: mode === "alias" ? alias : undefined,
          firstName: mode === "named" ? firstName : undefined,
          lastName: mode === "named" ? lastName : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDone({ mode, id: data.wish.id });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-6 text-white">
        <p className="font-hand text-2xl">
          {done.mode === "alias"
            ? "Your wish is in the snow."
            : "Your wish is saved and findable by your name."}
        </p>
        <div className="mt-5 flex gap-3">
          {done.mode === "alias" ? (
            <Link
              href={`/?focus=${done.id}`}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#0a1230]"
            >
              Find it in the field
            </Link>
          ) : (
            <Link
              href="/search"
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#0a1230]"
            >
              Try the name search
            </Link>
          )}
          <button
            onClick={() => {
              setDone(null);
              setBody("");
              setAlias("");
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
          className="w-full resize-none rounded-xl border border-white/20 bg-white/5 p-4 font-hand text-xl outline-none placeholder:text-white/40 focus:border-white/50"
        />
        <div className="mt-1 text-right text-xs text-white/40">{bodyLeft} left</div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/15 p-1">
        <button
          type="button"
          onClick={() => setMode("alias")}
          className={`rounded-lg px-3 py-2 text-sm transition ${
            mode === "alias" ? "bg-white text-[#0a1230]" : "text-white/80 hover:bg-white/10"
          }`}
        >
          Drift into the snow (alias)
        </button>
        <button
          type="button"
          onClick={() => setMode("named")}
          className={`rounded-lg px-3 py-2 text-sm transition ${
            mode === "named" ? "bg-white text-[#0a1230]" : "text-white/80 hover:bg-white/10"
          }`}
        >
          Findable by my name
        </button>
      </div>

      {mode === "alias" ? (
        <input
          value={alias}
          onChange={(e) => setAlias(e.target.value.slice(0, 40))}
          required
          placeholder="an alias to sign with"
          className="w-full rounded-xl border border-white/20 bg-white/5 p-3 outline-none placeholder:text-white/40 focus:border-white/50"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value.slice(0, 60))}
            required
            placeholder="First name"
            className="rounded-xl border border-white/20 bg-white/5 p-3 outline-none placeholder:text-white/40 focus:border-white/50"
          />
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value.slice(0, 60))}
            required
            placeholder="Surname"
            className="rounded-xl border border-white/20 bg-white/5 p-3 outline-none placeholder:text-white/40 focus:border-white/50"
          />
        </div>
      )}

      {mode === "named" && (
        <p className="text-xs text-white/50">
          Anyone who searches this exact first name and surname will see this wish. It will not
          appear in the public snowfield.
        </p>
      )}

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-white py-3 font-medium text-[#0a1230] disabled:opacity-60"
      >
        {busy ? "sending…" : "Send my wish"}
      </button>
    </form>
  );
}
