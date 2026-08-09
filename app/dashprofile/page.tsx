import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { ServerPixelAvatar } from "@/components/server-pixel-avatar";
import { getAuthUserIdFromCookie } from "@/lib/auth-server";
import DashProfileClient from "./dash-profile-client";

export const metadata: Metadata = {
  title: "Profile | TownHallUS.com",
  description:
    "Manage your TownHallUS.com profile, verification fields, location, and self-introduction.",
};

export default async function DashProfilePage() {
  const serverUserId = await getAuthUserIdFromCookie();
  const serverAvatar = serverUserId ? (
    <ServerPixelAvatar
      seed={serverUserId}
      alt="User avatar"
      size={128}
      priority
      className="size-full object-cover [image-rendering:pixelated]"
    />
  ) : null;

  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />
      <DashProfileClient
        serverAvatar={serverAvatar}
        serverAvatarSeed={serverUserId}
      />
      <SiteFooter />
    </div>
  );
}
