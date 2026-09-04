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
          className="rounded-full px-3.5 py-1.5 text-xs text-white/80 transition-all hover:bg-white/10 hover:text-white"
        >
          Search by name
        </Link>
        <Link
          href="/wish"
          className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 font-medium text-white backdrop-blur-md transition-all hover:bg-white/20 hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]"
        >
          Make a wish
        </Link>
      </nav>
    </header>
  );
}
