import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import CreatePostClient from "./create-post-client";

export const metadata: Metadata = {
  title: "Create Post | TownHallUS.com",
  description:
    "Create a TownHallUS.com post with statewide or nationwide scope.",
};

export default function CreatePostPage() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />
      <CreatePostClient />
      <SiteFooter />
    </div>
  );
}
