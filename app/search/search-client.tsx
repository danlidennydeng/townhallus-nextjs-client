"use client";

import Form from "next/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FileTextIcon,
  InboxIcon,
  LoaderCircleIcon,
  SearchIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import { DashPostCard, type DashPostRecord } from "@/app/dashpost/dash-post-client";
import { Button } from "@/components/ui/button";
import {
  postSearchHref,
  searchFields,
  searchMaxPage,
  searchPageSize,
  searchQueryMaxLength,
  type PostSearchField,
} from "@/lib/post-search";

const inputClassName =
  "h-11 w-full min-w-0 rounded-md border border-[#999999] bg-[#f7f7f7] px-3 text-[#000000] outline-none placeholder:text-[#666666] focus:border-[#9333EA] focus:ring-1 focus:ring-[#9333EA]";
const linkClassName =
  "inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 hover:text-[#7E22CE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9333EA]";

function SearchButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 w-full bg-[#9333EA] px-5 text-[#ffffff] hover:bg-[#7E22CE] sm:w-auto"
    >
      {pending ? (
        <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <SearchIcon className="size-4" aria-hidden="true" />
      )}
      {pending ? "Searching..." : "Search"}
    </Button>
  );
}

export default function SearchClient({
  error,
  field,
  hasMore,
  initialPosts,
  page,
  query,
  totalPosts,
}: Readonly<{
  error?: string;
  field: PostSearchField;
  hasMore: boolean;
  initialPosts: DashPostRecord[];
  page: number;
  query: string;
  totalPosts: number;
}>) {
  const router = useRouter();
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const posts = initialPosts.filter((post) => !deletedIds.includes(post._id)).slice(0, searchPageSize);
  const count = Math.max(0, totalPosts - deletedIds.length);
  const startIndex = (page - 1) * searchPageSize;
  const selectedField = searchFields.find((option) => option.value === field)?.label;

  return (
    <main className="flex flex-1 bg-[#e6e6e6] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-[1280px] space-y-5">
        <section className="rounded-md border border-[#999999] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className={linkClassName}>
              <ArrowLeftIcon className="size-4" aria-hidden="true" />
              Home
            </Link>
            <h1 className="text-right text-sm font-bold text-[#000000]">Search Posts</h1>
          </div>

          <Form action="/search" role="search" className="mt-4 grid items-end gap-4 md:grid-cols-[1fr_180px_auto]">
            <div className="min-w-0">
              <label htmlFor="post-search-query" className="mb-2 block font-semibold">
                Search text
              </label>
              <input
                id="post-search-query"
                type="search"
                name="q"
                defaultValue={query}
                required
                maxLength={searchQueryMaxLength}
                placeholder="Enter a state, title, or content"
                aria-describedby="post-search-help"
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="post-search-field" className="mb-2 block font-semibold">
                Search in
              </label>
              <select
                id="post-search-field"
                name="field"
                defaultValue={field}
                className={inputClassName}
              >
                {searchFields.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <SearchButton />
          </Form>
          <p id="post-search-help" className="mt-3 text-sm leading-6 text-[#4d4d4d]">
            Search by state, title, or content. Results appear nine at a time, with the closest matches first.
          </p>

          {query && !error ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-semibold" aria-live="polite">
              <span className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#999999] bg-[#eeeeee] px-3 py-2">
                <FileTextIcon className="size-4 text-[#9333EA]" aria-hidden="true" />
                {count} {count === 1 ? "result" : "results"}
              </span>
              <span className="min-w-0 break-words text-[#4d4d4d]">
                {selectedField} for “{query}”
              </span>
            </div>
          ) : null}
        </section>

        {error ? (
          <section className="rounded-md border border-[#B91C1C] bg-[#f7f7f7] p-5" role="alert">
            <p className="flex items-start gap-2 text-sm font-semibold text-[#B91C1C]">
              <TriangleAlertIcon className="size-5 shrink-0" aria-hidden="true" />
              {error}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.refresh()}
              className="mt-4 h-11 border-[#9333EA] bg-transparent text-[#000000]"
            >
              Try again
            </Button>
          </section>
        ) : !query || posts.length === 0 ? (
          <section className="rounded-md border border-[#999999] bg-[#f7f7f7] p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
            <span className="mx-auto flex size-14 items-center justify-center rounded-md border border-[#9333EA] bg-[#eeeeee] text-[#9333EA]">
              {!query ? <SearchIcon className="size-7" aria-hidden="true" /> : <InboxIcon className="size-7" aria-hidden="true" />}
            </span>
            <h2 className="mt-4 text-2xl font-semibold">
              {!query ? "Find posts" : page > 1 ? "No more results on this page." : "No matching posts."}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#4d4d4d]">
              {!query ? "Enter search text above to explore posts." : "Try different words or search in all fields."}
            </p>
          </section>
        ) : (
          <section aria-label="Search results" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <DashPostCard
                key={post._id}
                post={post}
                onDeleted={(postId) => setDeletedIds((ids) => [...ids, postId])}
              />
            ))}
          </section>
        )}

        {query && !error && (posts.length > 0 || page > 1) ? (
          <nav aria-label="Search result pages" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#999999] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
            <p className="text-sm font-medium text-[#4d4d4d]" aria-live="polite">
              {posts.length > 0 ? `Showing ${startIndex + 1}–${startIndex + posts.length} of ${count} results` : `Page ${page}`}
            </p>
            <div className="ml-auto flex items-center gap-4">
              {page > 1 ? (
                <Link href={postSearchHref(query, field, page - 1)} prefetch={false} className={linkClassName}>
                  <ArrowLeftIcon className="size-4" aria-hidden="true" />
                  Previous
                </Link>
              ) : null}
              {hasMore && page < searchMaxPage ? (
                <Link href={postSearchHref(query, field, page + 1)} prefetch={false} className={linkClassName}>
                  More
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </nav>
        ) : null}
      </div>
    </main>
  );
}
