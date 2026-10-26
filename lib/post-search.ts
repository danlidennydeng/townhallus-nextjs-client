import type { DashPostRecord } from "@/app/dashposts/dash-post-client";

export const searchPageSize = 9;
export const searchQueryMaxLength = 200;
export const searchMaxPage = 10000;
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
};

export function postSearchHref(query: string, field: PostSearchField, page = 1) {
  const params = new URLSearchParams({ q: query, field });
  if (page > 1) {
    params.set("page", String(page));
  }
  return `/search?${params.toString()}`;
}
