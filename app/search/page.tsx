import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { serverApiUrl } from "@/lib/api-server";
import {
  searchFields,
  searchMaxPage,
  searchQueryMaxLength,
  type PostSearchResponse,
} from "@/lib/post-search";
import SearchClient from "./search-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Search Posts | TownHallUS.com",
  description: "Search TownHallUS posts by state, title, or content.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function singleValue(value: SearchParams[string]) {
  return typeof value === "string" ? value : "";
}

async function fetchSearchResults(query: string, field: string, page: number) {
  const params = new URLSearchParams({ q: query, field, page: String(page) });
  const response = await fetch(serverApiUrl(`/post/search?${params.toString()}`), {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error("Search failed");
  }

  return (await response.json()) as PostSearchResponse;
}

export default async function SearchPage({
  searchParams,
}: Readonly<{ searchParams: Promise<SearchParams> }>) {
  const params = await searchParams;
  const query = singleValue(params.q).trim();
  const field =
    searchFields.find((option) => option.value === singleValue(params.field))?.value || "all";
  const requestedPage = Number(singleValue(params.page) || 1);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage >= 1 && requestedPage <= searchMaxPage
      ? requestedPage
      : 1;

  let results: PostSearchResponse = { posts: [], totalPosts: 0, hasMore: false };
  let error: string | undefined;

  if (query.length > searchQueryMaxLength) {
    error = `Use ${searchQueryMaxLength} characters or fewer for your search.`;
  } else if (query) {
    try {
      results = await fetchSearchResults(query, field, page);
    } catch {
      error = "Search is temporarily unavailable. Please try again.";
    }
  }

  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />
      <SearchClient
        key={JSON.stringify([query, field, page, results.posts.map((post) => post._id)])}
        error={error}
        field={field}
        hasMore={results.hasMore}
        initialPosts={results.posts}
        page={page}
        query={query}
        totalPosts={results.totalPosts}
      />
      <SiteFooter />
    </div>
  );
}
