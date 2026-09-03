import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8">
      <Link href="/" className="font-hand text-2xl sm:text-3xl text-white drop-shadow">
        A wish in the snow
      </Link>
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/search"
          className="rounded-full border border-white/25 px-4 py-1.5 text-white/90 hover:bg-white/10 transition"
        >
          Search by name
        </Link>
        <Link
          href="/wish"
          className="rounded-full bg-white px-4 py-1.5 font-medium text-[#0a1230] hover:bg-white/90 transition"
        >
          Make a wish
        </Link>
      </nav>
    </header>
  );
}
