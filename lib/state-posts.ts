import type { DashPostRecord } from "@/app/dashposts/dash-post-client";

export type StatePostsResponse = {
  posts: DashPostRecord[];
  totalPosts: number;
  hasMore: boolean;
  nextCursor: string | null;
};

export function statePostsPath(stateName: string, cursor?: string | null) {
  const params = new URLSearchParams({ state: stateName });
  if (cursor) {
    params.set("cursor", cursor);
  }
  return `/post/state-feed?${params.toString()}`;
}
