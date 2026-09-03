import { Suspense } from "react";
import Snow from "@/components/Snow";
import SiteHeader from "@/components/SiteHeader";
import SnowField from "@/components/SnowField";

export default function HomePage() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col">
      <Snow />
      <SiteHeader />
      <Suspense fallback={<div className="flex-1" />}>
        <SnowField />
      </Suspense>
    </main>
  );
}
