import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import LogInClient from "./log-in-client";

export const metadata: Metadata = {
  title: "Log In | TownHallUS.com",
  description:
    "Log in to TownHallUS.com to access your profile and account dashboard.",
};

export default function LogInPage() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />
      <Suspense
        fallback={
          <main className="flex flex-1 items-center justify-center bg-[#e6e6e6] px-4 py-12">
            <div className="rounded-md border border-[#999999] bg-[#f7f7f7] px-5 py-4 font-semibold text-[#000000] shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
              Loading log in...
            </div>
          </main>
        }
      >
        <LogInClient />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
