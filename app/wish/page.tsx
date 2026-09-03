import Snow from "@/components/Snow";
import SiteHeader from "@/components/SiteHeader";
import WishComposer from "@/components/WishComposer";

export default function WishPage() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col">
      <Snow />
      <SiteHeader />
      <div className="relative z-10 mx-auto w-full max-w-lg px-5 py-10">
        <h1 className="font-hand text-4xl text-white">Leave a wish</h1>
        <p className="mt-2 text-sm text-white/70">
          Write your Christmas wish. Then choose whether people can find it by your name, or
          whether it drifts into the snowfield under an alias.
        </p>
        <WishComposer />
      </div>
    </main>
  );
}
