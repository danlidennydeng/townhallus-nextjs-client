"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/site-chrome-content";
import { StaticSiteHeader } from "@/components/static-site-header";
import { apiUrl } from "@/lib/api-client";
import {
  searchFields,
  searchMaxPage,
  searchQueryMaxLength,
  type PostSearchField,
  type PostSearchResponse,
} from "@/lib/post-search";
import SearchClient from "./search-client";

type SearchRequest = {
  query: string;
  field: PostSearchField;
  page: number;
};

function SearchResults({ query, field, page }: Readonly<SearchRequest>) {
  const validationError = query.length > searchQueryMaxLength
    ? `Use ${searchQueryMaxLength} characters or fewer for your search.`
    : undefined;
  const [results, setResults] = useState<PostSearchResponse>({
    posts: [],
    totalPosts: 0,
    hasMore: false,
  });
  const [error, setError] = useState<string | undefined>(validationError);
  const [loading, setLoading] = useState(Boolean(query) && !validationError);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (!query || query.length > searchQueryMaxLength) {
      return;
    }

    const controller = new AbortController();
    let ignore = false;
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    async function loadResults() {
      setLoading(true);
      setError(undefined);

      try {
        const params = new URLSearchParams({ q: query, field, page: String(page) });
        const response = await fetch(apiUrl(`/post/search?${params.toString()}`), {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = (await response.json()) as PostSearchResponse;

        if (!ignore) {
          setResults(data);
        }
      } catch {
        if (!ignore) {
          setError("Search is temporarily unavailable. Please try again.");
        }
      } finally {
        window.clearTimeout(timeout);
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadResults();

    return () => {
      ignore = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query, field, page, refreshCount]);

  return (
    <SearchClient
      key={JSON.stringify([query, field, page, results.posts.map((post) => post._id)])}
      error={error}
      field={field}
      hasMore={results.hasMore}
      initialPosts={results.posts}
      loading={loading}
      onRefresh={() => setRefreshCount((count) => count + 1)}
      page={page}
      query={query}
      totalPosts={results.totalPosts}
    />
  );
}

export default function SearchView() {
  const searchParams = useSearchParams();
  const singleValue = (name: string) => {
    const values = searchParams.getAll(name);
    return values.length === 1 ? values[0] : "";
  };
  const query = singleValue("q").trim();
  const field = searchFields.find((option) => option.value === singleValue("field"))?.value || "all";
  const requestedPage = Number(singleValue("page") || 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage >= 1 && requestedPage <= searchMaxPage
    ? requestedPage
    : 1;

  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <StaticSiteHeader />
      <SearchResults
        key={JSON.stringify([query, field, page])}
        query={query}
        field={field}
        page={page}
      />
      <SiteFooter />
    </div>
  );
}
