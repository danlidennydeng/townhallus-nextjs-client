"use client";

import { SiteFooter } from "@/components/site-chrome-content";
import { StaticSiteHeader } from "@/components/static-site-header";
import CreatePostClient from "./create-post-client";

export default function CreatePostView() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <StaticSiteHeader />
      <CreatePostClient />
      <SiteFooter />
    </div>
  );
}
