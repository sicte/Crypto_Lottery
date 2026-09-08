"use client";

import { Providers } from "@/lib/providers";
import { LotteryPage } from "@/components/LotteryPage";

export default function Home() {
  return (
    <Providers>
      <LotteryPage />
    </Providers>
  );
}