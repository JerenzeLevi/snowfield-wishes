"use client";

import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  body: string;
  visibility: string;
  alias: string | null;
  first_name: string | null;
  last_name: string | null;
  status: "visible" | "hidden";
  report_count: number;
  created_at: string;
};

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [entered, setEntered] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_token");
    if (saved) {
      setToken(saved);
      setEntered(true);
    }
  }, []);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/admin/wishes", { headers: { "x-admin-token": token } });
    if (!res.ok) {
      setError("Unauthorized or failed.");
      setRows([]);
      return;
    }
    const data = await res.json();
    setRows(data.wishes);
  }, [token]);

  useEffect(() => {
    if (entered) load();
  }, [entered, load]);

  async function setStatus(id: string, status: "visible" | "hidden") {
    await fetch("/api/admin/wishes", {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  if (!entered) {
    return (
      <main className="mx-auto max-w-sm px-5 py-16 text-white">
        <h1 className="font-hand text-3xl">Moderation</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sessionStorage.setItem("admin_token", token);
            setEntered(true);
          }}
          className="mt-6 flex gap-2"
        >
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="admin secret"
            className="flex-1 rounded-lg border border-white/20 bg-white/5 p-2 outline-none"
          />
          <button className="rounded-lg bg-white px-4 text-[#0a1230]">Enter</button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 text-white">
      <div className="flex items-center justify-between">
        <h1 className="font-hand text-3xl">Moderation</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem("admin_token");
            setEntered(false);
          }}
          className="text-sm text-white/60 hover:text-white"
        >
          sign out
        </button>
      </div>
      {error && <p className="mt-4 text-rose-300">{error}</p>}
      <div className="mt-6 space-y-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className={`rounded-xl border p-4 ${
              r.status === "hidden" ? "border-rose-500/40 bg-rose-500/5" : "border-white/15 bg-white/5"
            }`}
          >
            <p className="font-hand text-lg">{r.body}</p>
            <p className="mt-1 text-xs text-white/50">
              {r.visibility === "named"
                ? `${r.first_name} ${r.last_name}`
                : `alias: ${r.alias}`}{" "}
              · reports: {r.report_count} · {new Date(r.created_at).toLocaleString()} · {r.status}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setStatus(r.id, "hidden")}
                disabled={r.status === "hidden"}
                className="rounded-full border border-white/25 px-3 py-1 text-xs disabled:opacity-40"
              >
                Hide
              </button>
              <button
                onClick={() => setStatus(r.id, "visible")}
                disabled={r.status === "visible"}
                className="rounded-full border border-white/25 px-3 py-1 text-xs disabled:opacity-40"
              >
                Un-hide
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
