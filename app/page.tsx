import type { Metadata } from "next";
import { Suspense } from "react";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://australia-cgt-reform-calculator.setiyaputra.me",
  },
};

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageClient />
    </Suspense>
  );
}
