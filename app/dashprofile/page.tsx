import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { ServerPixelAvatar } from "@/components/server-pixel-avatar";
import { serverApiUrl } from "@/lib/api-server";
import { getAuthUserIdFromCookie } from "@/lib/auth-server";
import DashProfileClient from "./dash-profile-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Profile | TownHallUS.com",
  description:
    "Manage your TownHallUS.com profile, verification fields, location, and self-introduction.",
};

type PostsCountResponse = {
  totalPosts?: number;
};

type CommentsCountResponse = {
  totalComments?: number;
};

async function fetchUserPostCount(userId: string) {
  const params = new URLSearchParams({
    limit: "1",
    startIndex: "0",
    userId,
  });

  try {
    const response = await fetch(serverApiUrl(`/post/getposts?${params.toString()}`), {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as PostsCountResponse;
    return typeof data.totalPosts === "number" ? data.totalPosts : null;
  } catch {
    return null;
  }
}

async function fetchUserCommentCount(userId: string) {
  const params = new URLSearchParams({
    limit: "1",
    startIndex: "0",
  });

  try {
    const response = await fetch(
      serverApiUrl(`/comment/getUserComments/${userId}?${params.toString()}`),
      { cache: "no-store" }
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as CommentsCountResponse;
    return typeof data.totalComments === "number" ? data.totalComments : null;
  } catch {
    return null;
  }
}

export default async function DashProfilePage() {
  const serverUserId = await getAuthUserIdFromCookie();
  const [initialTotalPosts, initialTotalComments] = serverUserId
    ? await Promise.all([
        fetchUserPostCount(serverUserId),
        fetchUserCommentCount(serverUserId),
      ])
    : [null, null];
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
        initialTotalComments={initialTotalComments}
        initialTotalPosts={initialTotalPosts}
        serverAvatar={serverAvatar}
        serverAvatarSeed={serverUserId}
      />
      <SiteFooter />
    </div>
  );
}
