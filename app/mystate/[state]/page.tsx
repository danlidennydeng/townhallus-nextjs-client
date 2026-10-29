import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { serverApiUrl } from "@/lib/api-server";
import { statePostsPath, type StatePostsResponse } from "@/lib/state-posts";
import MyStateClient from "./my-state-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MyStatePageParams = {
  state: string;
};

function normalizeStateParam(value: string) {
  let stateName: string;
  try {
    stateName = decodeURIComponent(value).trim();
  } catch {
    stateName = value.trim();
  }

  return stateName.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<MyStatePageParams>;
}>): Promise<Metadata> {
  const { state } = await params;
  const stateName = normalizeStateParam(state) || "State";

  return {
    title: `${stateName} Posts | TownHallUS.com`,
    description: `Read TownHallUS posts published in ${stateName}.`,
  };
}

async function fetchStatePosts(stateName: string) {
  const emptyResult = { failed: true, posts: [], totalPosts: 0, nextCursor: null };

  try {
    const response = await fetch(serverApiUrl(statePostsPath(stateName)), {
      cache: "no-store",
    });

    if (!response.ok) {
      return emptyResult;
    }

    const data = (await response.json()) as StatePostsResponse;
    const posts = data.posts || [];

    return {
      failed: false,
      posts,
      totalPosts: typeof data.totalPosts === "number" ? data.totalPosts : posts.length,
      nextCursor: data.hasMore ? data.nextCursor : null,
    };
  } catch {
    return emptyResult;
  }
}

export default async function MyStatePage({
  params,
}: Readonly<{
  params: Promise<MyStatePageParams>;
}>) {
  const { state } = await params;
  const stateName = normalizeStateParam(state);
  const { failed, posts, totalPosts, nextCursor } = await fetchStatePosts(stateName);

  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />
      <MyStateClient
        key={stateName}
        initialFetchFailed={failed}
        initialNextCursor={nextCursor}
        initialPosts={posts}
        initialTotalPosts={totalPosts}
        stateName={stateName}
      />
      <SiteFooter />
    </div>
  );
}
