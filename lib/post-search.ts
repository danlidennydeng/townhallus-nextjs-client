import type { DashPostRecord } from "@/app/dashposts/dash-post-client";

export const searchPageSize = 9;
export const searchQueryMaxLength = 200;
export const searchCursorMaxLength = 4096;
export const searchFields = [
  { value: "all", label: "All fields" },
  { value: "state", label: "State" },
  { value: "title", label: "Title" },
  { value: "content", label: "Content" },
] as const;

export type PostSearchField = (typeof searchFields)[number]["value"];

export type PostSearchResponse = {
  posts: DashPostRecord[];
  totalPosts: number;
  hasMore: boolean;
  nextCursor: string | null;
  previousCursor: string | null;
};

export function postSearchHref(query: string, field: PostSearchField, cursor?: string | null) {
  const params = new URLSearchParams({ q: query, field });
  if (cursor) {
    params.set("cursor", cursor);
  }
  return `/search?${params.toString()}`;
}
