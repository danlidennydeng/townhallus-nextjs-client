"use client";

import { SiteFooter } from "@/components/site-chrome-content";
import { StaticSiteHeader } from "@/components/static-site-header";
import CreateAccountClient from "./create-account-client";

export default function CreateAccountView() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <StaticSiteHeader />
      <CreateAccountClient />
      <SiteFooter />
    </div>
  );
}
