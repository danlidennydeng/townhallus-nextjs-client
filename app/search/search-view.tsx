"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/site-chrome-content";
import { StaticSiteHeader } from "@/components/static-site-header";
import { apiUrl } from "@/lib/api-client";
import {
  searchFields,
  searchCursorMaxLength,
  searchQueryMaxLength,
  type PostSearchField,
  type PostSearchResponse,
} from "@/lib/post-search";
import SearchClient from "./search-client";

type SearchRequest = {
  query: string;
  field: PostSearchField;
  cursor: string;
};

function SearchResults({ query, field, cursor }: Readonly<SearchRequest>) {
  const validationError = query.length > searchQueryMaxLength
    ? `Use ${searchQueryMaxLength} characters or fewer for your search.`
    : cursor && (cursor.length > searchCursorMaxLength || !/^[A-Za-z0-9_-]+$/.test(cursor))
      ? "Invalid search cursor. Start a new search."
      : undefined;
  const [results, setResults] = useState<PostSearchResponse>({
    posts: [],
    totalPosts: 0,
    hasMore: false,
    nextCursor: null,
    previousCursor: null,
  });
  const [error, setError] = useState<string | undefined>(validationError);
  const [loading, setLoading] = useState(Boolean(query) && !validationError);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (!query || validationError) {
      return;
    }

    const controller = new AbortController();
    let ignore = false;
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    async function loadResults() {
      setLoading(true);
      setError(undefined);

      try {
        const params = new URLSearchParams({ q: query, field });
        if (cursor) params.set("cursor", cursor);
        const response = await fetch(apiUrl(`/post/search?${params.toString()}`), {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 400 && cursor) {
            throw new Error("Invalid search cursor. Start a new search.");
          }
          throw new Error("Search is temporarily unavailable. Please try again.");
        }

        const data = (await response.json()) as PostSearchResponse;

        if (!ignore) {
          setResults(data);
        }
      } catch (error) {
        if (!ignore) {
          setError(error instanceof Error && error.message === "Invalid search cursor. Start a new search."
            ? error.message
            : "Search is temporarily unavailable. Please try again.");
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
  }, [query, field, cursor, refreshCount, validationError]);

  return (
    <SearchClient
      key={JSON.stringify([query, field, cursor, results.posts.map((post) => post._id)])}
      cursor={cursor}
      error={error}
      field={field}
      nextCursor={results.nextCursor}
      previousCursor={results.previousCursor}
      initialPosts={results.posts}
      loading={loading}
      onRefresh={() => setRefreshCount((count) => count + 1)}
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
  // Older page-number URLs start at the first page of the same search.
  const cursorValues = searchParams.getAll("cursor");
  const cursor = cursorValues.length > 1 ? "!" : cursorValues[0] || "";

  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <StaticSiteHeader />
      <SearchResults
        key={JSON.stringify([query, field, cursor])}
        query={query}
        field={field}
        cursor={cursor}
      />
      <SiteFooter />
    </div>
  );
}
