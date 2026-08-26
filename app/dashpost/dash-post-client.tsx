"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  FileTextIcon,
  ImageIcon,
  InboxIcon,
  LoaderCircleIcon,
  PenLineIcon,
  TriangleAlertIcon,
  VideoIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import PostDeleteButton from "@/app/post/[postSlug]/post-delete-button";
import { Button } from "@/components/ui/button";
import { StateFlagIcon } from "@/components/state-flag";
import { apiUrl } from "@/lib/api-client";
import {
  getStoredUser,
  subscribeToAuthChanges,
  type TownHallUser,
} from "@/lib/auth-client";
import { pixelAvatarPath } from "@/lib/avatar";

export const dashPostPageSize = 9;

type UserStatus = {
  _id?: string;
  isAdmin?: boolean;
  isCitizen?: boolean;
  isCommenter?: boolean;
  isPoster?: boolean;
  isVoter?: boolean;
};

type MediaLink = {
  kind?: "image" | "document" | "video";
  label?: string;
  url?: string;
  videoId?: string;
};

export type DashPostRecord = {
  _id: string;
  city?: string;
  content?: string;
  county?: string;
  createdAt?: string;
  isPublishable?: boolean;
  mediaLinks?: MediaLink[];
  pictureURL?: string;
  slug: string;
  state?: string;
  title?: string;
  updatedAt?: string;
  userId?: string | UserStatus;
  username?: string;
  videoId?: string;
};

type PostsResponse = {
  posts?: DashPostRecord[];
  totalPosts?: number;
};

type StatusBadgeConfig = {
  label: string;
  rounded: "full" | "md";
  title: string;
};

type DashPostClientProps = {
  initialFetchFailed?: boolean;
  initialHasMore: boolean;
  initialPosts: DashPostRecord[];
  initialTotalPosts: number;
  userId: string;
};

function getAuthorId(post: DashPostRecord) {
  return typeof post.userId === "string" ? post.userId : post.userId?._id || "";
}

function getAuthorStatus(post: DashPostRecord) {
  return typeof post.userId === "object" && post.userId ? post.userId : {};
}

function getStatusBadges(status: UserStatus): StatusBadgeConfig[] {
  return [
    status.isVoter
      ? { label: "V", title: "U.S. Voter Verified", rounded: "full" as const }
      : null,
    status.isCitizen
      ? { label: "Z", title: "U.S. Citizen Verified", rounded: "full" as const }
      : null,
    status.isAdmin
      ? { label: "A", title: "Administrator", rounded: "full" as const }
      : null,
    status.isPoster
      ? { label: "P", title: "Post or Publish Privilege", rounded: "md" as const }
      : null,
    status.isCommenter
      ? { label: "C", title: "Comment Privilege", rounded: "md" as const }
      : null,
  ].filter(Boolean) as StatusBadgeConfig[];
}

function StatusBadge({ label, rounded, title }: Readonly<StatusBadgeConfig>) {
  return (
    <span
      title={title}
      className={`flex size-7 items-center justify-center border-2 border-[#9333EA] text-sm font-bold text-[#9333EA] ${
        rounded === "full" ? "rounded-full" : "rounded-md"
      }`}
    >
      {label}
    </span>
  );
}

function decodeHtmlText(value = "") {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function getPlainText(content = "") {
  return decodeHtmlText(
    content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function getPostPreview(content?: string) {
  const text = getPlainText(content || "");

  if (!text) {
    return "No body content.";
  }

  return text.length > 280 ? `${text.slice(0, 280).trim()}...` : text;
}

function formatDate(value?: string) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getMediaSummary(post: DashPostRecord) {
  const mediaLinks = post.mediaLinks || [];

  return {
    documents: mediaLinks.filter((link) => link.kind === "document").length,
    images:
      mediaLinks.filter((link) => link.kind === "image").length ||
      (post.pictureURL ? 1 : 0),
    videos:
      mediaLinks.filter((link) => link.kind === "video").length ||
      (post.videoId ? 1 : 0),
  };
}

function StateChip({ state }: Readonly<{ state?: string }>) {
  if (!state) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-[#9333EA] bg-[#eeeeee] px-3 py-1 text-sm font-semibold text-[#9333EA]">
      <StateFlagIcon state={state} />
      {state}
    </span>
  );
}

function LocationLine({ post }: Readonly<{ post: DashPostRecord }>) {
  const locations = [post.county, post.city].filter(Boolean);

  if (locations.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 flex flex-wrap gap-2 text-sm font-medium text-[#4d4d4d]">
      {locations.map((location) => (
        <span key={location}>{location}</span>
      ))}
    </div>
  );
}

function MediaIconStrip({ post }: Readonly<{ post: DashPostRecord }>) {
  const summary = getMediaSummary(post);
  const mediaIcons = [
    summary.images ? { icon: ImageIcon, label: "Has image" } : null,
    summary.videos ? { icon: VideoIcon, label: "Has video" } : null,
    summary.documents ? { icon: FileTextIcon, label: "Has document" } : null,
  ].filter(Boolean);

  if (mediaIcons.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex shrink-0 flex-wrap items-center gap-2 text-[#9333EA]">
      {mediaIcons.map((item) => {
        if (!item) {
          return null;
        }

        const Icon = item.icon;

        return (
          <span
            key={item.label}
            title={item.label}
            className="flex size-9 items-center justify-center rounded-md border border-[#9333EA] bg-transparent text-[#9333EA]"
          >
            <Icon className="size-4" aria-hidden="true" />
          </span>
        );
      })}
    </div>
  );
}

export function DashPostCard({
  onDeleted,
  post,
}: Readonly<{
  onDeleted: (postId: string) => void;
  post: DashPostRecord;
}>) {
  const authorId = getAuthorId(post);
  const statusBadges = getStatusBadges(getAuthorStatus(post));

  return (
    <article className="flex h-[618px] flex-col overflow-hidden rounded-md border border-[#999999] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
      <div className="flex items-start justify-between gap-3 border-b border-[#c4c4c4] pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-sm text-[#4d4d4d]">
            <CalendarDaysIcon className="size-4" aria-hidden="true" />
            {formatDate(post.createdAt)}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <StateChip state={post.state} />
          <PostDeleteButton
            compact
            onDeleted={() => onDeleted(post._id)}
            postAuthorId={authorId}
            postId={post._id}
            redirectTo={null}
          />
        </div>
      </div>

      <Link
        href={`/post/${post.slug}`}
        className="mt-4 block min-h-0 flex-1 text-[#000000] no-underline"
      >
        <h2 className="break-words text-2xl font-semibold leading-tight text-[#000000]">
          {post.title || "Untitled post"}
        </h2>
        <p className="mt-3 max-h-[105px] overflow-hidden text-base leading-7 text-[#333333]">
          {getPostPreview(post.content)}
        </p>
      </Link>

      <MediaIconStrip post={post} />

      <div className="mt-4 shrink-0 border-t border-[#c4c4c4] pt-4 text-sm">
        <div className="flex min-w-0 items-center gap-3">
          {authorId ? (
            <span className="flex size-11 shrink-0 overflow-hidden rounded-full border border-[#9333EA] bg-[#eeeeee] shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
              <Image
                src={pixelAvatarPath(authorId)}
                alt={`${post.username || "User"} avatar`}
                width={44}
                height={44}
                unoptimized
                className="size-full object-cover [image-rendering:pixelated]"
              />
            </span>
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 break-words font-semibold text-[#000000]">
                @{post.username || "anonymous"}
              </span>
              {statusBadges.map((badge) => (
                <StatusBadge key={badge.label} {...badge} />
              ))}
            </div>
            <LocationLine post={post} />
          </div>
        </div>

        <Link
          href={`/post/${post.slug}`}
          className="mt-3 flex justify-end gap-1.5 text-right text-sm font-semibold text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 hover:text-[#7E22CE]"
        >
          Open
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function EmptyPosts({ canCreate }: Readonly<{ canCreate: boolean }>) {
  return (
    <section className="rounded-md border border-[#999999] bg-[#f7f7f7] p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
      <span className="mx-auto flex size-14 items-center justify-center rounded-md border border-[#9333EA] bg-[#eeeeee] text-[#9333EA]">
        <InboxIcon className="size-7" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-2xl font-semibold text-[#000000]">
        No posts yet.
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

export default function DashPostClient({
  initialFetchFailed = false,
  initialHasMore,
  initialPosts,
  initialTotalPosts,
  userId,
}: Readonly<DashPostClientProps>) {
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
        userId,
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
  }, [hasMore, loadingMore, posts, totalPosts, userId]);

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
              href="/dashprofile"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 hover:text-[#7E22CE]"
            >
              <ArrowLeftIcon className="size-4" aria-hidden="true" />
              Profile
            </Link>
            <h1 className="text-right text-sm font-bold text-[#000000]">
              My Posts
            </h1>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
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
          <EmptyPosts canCreate={canCreate} />
        ) : (
          <section
            aria-label="My posts"
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
