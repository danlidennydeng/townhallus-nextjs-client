"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FileTextIcon,
  InboxIcon,
  LoaderCircleIcon,
  MapPinIcon,
  PenLineIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DashPostCard,
  dashPostPageSize,
  type DashPostRecord,
} from "@/app/dashpost/dash-post-client";
import { StateFlagIcon } from "@/components/state-flag";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-client";
import {
  getStoredUser,
  subscribeToAuthChanges,
  type TownHallUser,
} from "@/lib/auth-client";

type PostsResponse = {
  posts?: DashPostRecord[];
  totalPosts?: number;
};

type MyStateClientProps = {
  initialFetchFailed?: boolean;
  initialHasMore: boolean;
  initialPosts: DashPostRecord[];
  initialTotalPosts: number;
  stateName: string;
};

function EmptyStatePosts({ canCreate, stateName }: Readonly<{
  canCreate: boolean;
  stateName: string;
}>) {
  return (
    <section className="rounded-md border border-[#999999] bg-[#f7f7f7] p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
      <span className="mx-auto flex size-14 items-center justify-center rounded-md border border-[#9333EA] bg-[#eeeeee] text-[#9333EA]">
        <InboxIcon className="size-7" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-2xl font-semibold text-[#000000]">
        No posts in {stateName} yet.
      </h2>
      {canCreate ? (
        <Button
          nativeButton={false}
          render={<Link href="/create-post" />}
          className="mt-5 bg-[#9333EA] text-[#ffffff] hover:bg-[#7E22CE]"
        >
          <PenLineIcon className="size-4" aria-hidden="true" />
          Create A Post
        </Button>
      ) : null}
    </section>
  );
}

export default function MyStateClient({
  initialFetchFailed = false,
  initialHasMore,
  initialPosts,
  initialTotalPosts,
  stateName,
}: Readonly<MyStateClientProps>) {
  const [posts, setPosts] = useState(initialPosts);
  const [totalPosts, setTotalPosts] = useState(initialTotalPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(
    initialFetchFailed ? "Posts could not be loaded." : ""
  );
  const [currentUser, setCurrentUser] = useState<TownHallUser | null>(null);
  const canCreate = Boolean(currentUser?.isPoster);

  useEffect(() => {
    function syncUser() {
      setCurrentUser(getStoredUser());
    }

    syncUser();
    return subscribeToAuthChanges(syncUser);
  }, []);

  const shownLabel = useMemo(() => {
    return `${totalPosts} ${totalPosts === 1 ? "post" : "posts"}`;
  }, [totalPosts]);

  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loadingMore) {
      return;
    }

    setLoadingMore(true);
    setLoadError("");

    try {
      const params = new URLSearchParams({
        limit: String(dashPostPageSize),
        startIndex: String(posts.length),
        state: stateName,
      });
      const response = await fetch(apiUrl(`/post/getposts?${params.toString()}`), {
        credentials: "include",
        method: "GET",
      });

      if (!response.ok) {
        setLoadError("More posts could not be loaded.");
        return;
      }

      const data = (await response.json()) as PostsResponse;
      const nextPosts = data.posts || [];
      const nextTotalPosts =
        typeof data.totalPosts === "number" ? data.totalPosts : totalPosts;
      const currentIds = new Set(posts.map((post) => post._id));
      const mergedPosts = [
        ...posts,
        ...nextPosts.filter((post) => !currentIds.has(post._id)),
      ];

      setPosts(mergedPosts);
      setTotalPosts(nextTotalPosts);
      setHasMore(nextTotalPosts > mergedPosts.length);
    } catch {
      setLoadError("More posts could not be loaded.");
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, posts, stateName, totalPosts]);

  function handleDeleted(postId: string) {
    const wasLoaded = posts.some((post) => post._id === postId);
    const nextPosts = posts.filter((post) => post._id !== postId);
    const nextTotalPosts = wasLoaded ? Math.max(0, totalPosts - 1) : totalPosts;

    setPosts(nextPosts);
    setTotalPosts(nextTotalPosts);
    setHasMore(nextTotalPosts > nextPosts.length);
  }

  return (
    <main className="flex flex-1 bg-[#e6e6e6] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-[1280px] space-y-5">
        <section className="rounded-md border border-[#999999] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 hover:text-[#7E22CE]"
            >
              <ArrowLeftIcon className="size-4" aria-hidden="true" />
              Home
            </Link>
            <h1 className="text-right text-sm font-bold text-[#000000]">
              {stateName} Posts
            </h1>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex h-10 items-center gap-2 rounded-md border border-[#999999] bg-[#eeeeee] px-3 text-sm font-semibold text-[#000000]">
              <StateFlagIcon state={stateName} />
              {stateName.trim().toLowerCase() === "california" ? null : (
                <MapPinIcon className="size-4 text-[#9333EA]" aria-hidden="true" />
              )}
              {stateName}
            </span>
            <span className="inline-flex h-10 items-center gap-2 rounded-md border border-[#999999] bg-[#eeeeee] px-3 text-sm font-semibold text-[#000000]">
              <FileTextIcon className="size-4 text-[#9333EA]" aria-hidden="true" />
              {shownLabel}
            </span>
            {canCreate ? (
              <Button
                nativeButton={false}
                render={<Link href="/create-post" />}
                className="h-10 bg-[#9333EA] text-[#ffffff] hover:bg-[#7E22CE]"
              >
                <PenLineIcon className="size-4" aria-hidden="true" />
                Create A Post
              </Button>
            ) : null}
          </div>
        </section>

        {loadError ? (
          <div
            className="flex items-start gap-2 rounded-md border border-[#B91C1C] bg-[#f7f7f7] px-4 py-3 text-sm font-semibold text-[#B91C1C]"
            aria-live="polite"
          >
            <TriangleAlertIcon
              className="mt-0.5 size-4 shrink-0 text-[#B91C1C]"
              aria-hidden="true"
            />
            <span>{loadError}</span>
          </div>
        ) : null}

        {posts.length === 0 ? (
          <EmptyStatePosts canCreate={canCreate} stateName={stateName} />
        ) : (
          <section
            aria-label={`${stateName} posts`}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {posts.map((post) => (
              <DashPostCard
                key={post._id}
                onDeleted={handleDeleted}
                post={post}
              />
            ))}
          </section>
        )}

        {hasMore ? (
          <section className="flex justify-end rounded-md border border-[#999999] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
            {loadingMore ? (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#4d4d4d]">
                <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                Loading posts
              </span>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void loadMorePosts();
                }}
                className="h-11 border-[#9333EA] bg-[#f7f7f7] px-5 text-[#000000] hover:bg-[#d6d6d6]"
              >
                More
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Button>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}
