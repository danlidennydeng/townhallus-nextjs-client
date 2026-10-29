"use client";

import { ArrowRightIcon, LoaderCircleIcon, TriangleAlertIcon } from "lucide-react";
import type { ReactNode } from "react";

import { DashPostCard, type DashPostRecord } from "@/app/dashposts/dash-post-client";
import { Button } from "@/components/ui/button";
import { useCursorFeed } from "@/hooks/use-cursor-feed";

export default function HomePostsClient({
  initialPosts,
  initialNextCursor,
  isAuthenticated,
  emptyState,
  showPagination = true,
}: Readonly<{
  initialPosts: DashPostRecord[];
  initialNextCursor: string | null;
  isAuthenticated: boolean;
  emptyState: ReactNode;
  showPagination?: boolean;
}>) {
  const { items: posts, hasMore, loadingMore, loadError, loadMore, removeItem } = useCursorFeed({
    path: "/post/home-feed",
    initialItems: initialPosts,
    initialNextCursor,
    loadErrorMessage: "More posts could not be loaded.",
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.length > 0 ? posts.map((post) => (
          <DashPostCard
            key={post._id}
            post={post}
            postHref={isAuthenticated ? undefined : "/log-in"}
            onDeleted={removeItem}
          />
        )) : emptyState}
      </div>

      {showPagination && loadError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-[#B91C1C] bg-[#f7f7f7] px-4 py-3 text-sm font-semibold text-[#B91C1C]"
        >
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{loadError}</span>
        </div>
      ) : null}

      {showPagination && hasMore ? (
        <div className="flex justify-end rounded-md border border-[#999999] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
          {loadingMore ? (
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#4d4d4d]" role="status">
              <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
              Loading posts
            </span>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => { void loadMore(); }}
              className="h-11 border-[#9333EA] bg-[#f7f7f7] px-5 text-[#000000] hover:bg-[#d6d6d6]"
            >
              More
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
