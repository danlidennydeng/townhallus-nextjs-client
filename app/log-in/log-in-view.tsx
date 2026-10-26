"use client";

import { SiteFooter } from "@/components/site-chrome-content";
import { StaticSiteHeader } from "@/components/static-site-header";
import LogInClient from "./log-in-client";

export default function LogInView() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <StaticSiteHeader />
      <LogInClient />
      <SiteFooter />
    </div>
  );
}
