import Snow from "@/components/Snow";
import SiteHeader from "@/components/SiteHeader";
import NameSearch from "@/components/NameSearch";

export default function SearchPage() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col">
      <Snow />
      <SiteHeader />
      <div className="relative z-10 mx-auto w-full max-w-xl px-5 py-10">
        <h1 className="font-hand text-4xl text-white">Find someone&apos;s wishes</h1>
        <p className="mt-2 text-sm text-white/70">
          Type a first name and surname exactly. You&apos;ll see the wishes that person chose to
          make findable by name.
        </p>
        <NameSearch />
      </div>
    </main>
  );
}
