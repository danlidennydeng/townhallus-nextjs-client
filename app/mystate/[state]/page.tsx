import type { Metadata } from "next";

import {
  dashPostPageSize,
  type DashPostRecord,
} from "@/app/dashpost/dash-post-client";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { serverApiUrl } from "@/lib/api-server";
import MyStateClient from "./my-state-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MyStatePageParams = {
  state: string;
};

type PostsResponse = {
  posts?: DashPostRecord[];
  totalPosts?: number;
};

function decodeStateParam(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<MyStatePageParams>;
}>): Promise<Metadata> {
  const { state } = await params;
  const stateName = decodeStateParam(state) || "State";

  return {
    title: `${stateName} Posts | TownHallUS.com`,
    description: `Read TownHallUS posts published in ${stateName}.`,
  };
}

async function fetchStatePosts(stateName: string) {
  const params = new URLSearchParams({
    limit: String(dashPostPageSize),
    startIndex: "0",
    state: stateName,
  });

  try {
    const response = await fetch(serverApiUrl(`/post/getposts?${params.toString()}`), {
      cache: "no-store",
    });

    if (!response.ok) {
      return { failed: true, posts: [], totalPosts: 0 };
    }

    const data = (await response.json()) as PostsResponse;
    const posts = data.posts || [];

    return {
      failed: false,
      posts,
      totalPosts: typeof data.totalPosts === "number" ? data.totalPosts : posts.length,
    };
  } catch {
    return { failed: true, posts: [], totalPosts: 0 };
  }
}

export default async function MyStatePage({
  params,
}: Readonly<{
  params: Promise<MyStatePageParams>;
}>) {
  const { state } = await params;
  const stateName = decodeStateParam(state);
  const { failed, posts, totalPosts } = await fetchStatePosts(stateName);

  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />
      <MyStateClient
        initialFetchFailed={failed}
        initialHasMore={totalPosts > posts.length}
        initialPosts={posts}
        initialTotalPosts={totalPosts}
        stateName={stateName}
      />
      <SiteFooter />
    </div>
  );
}
