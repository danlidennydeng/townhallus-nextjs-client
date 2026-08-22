import Link from "next/link";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  Clock3Icon,
  FileTextIcon,
} from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { ServerPixelAvatar } from "@/components/server-pixel-avatar";
import { serverApiUrl } from "@/lib/api-server";
import CommentsSection from "./comments-section";
import PostDeleteButton from "./post-delete-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

type TownHallPost = {
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
  posts?: TownHallPost[];
};

type StatusBadgeConfig = {
  label: string;
  rounded: "full" | "md";
  title: string;
};

const youtubeVideoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
const youtubeHosts = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

function getAuthorId(post: TownHallPost) {
  return typeof post.userId === "string" ? post.userId : post.userId?._id || "";
}

function getAuthorStatus(post: TownHallPost) {
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

function getReadingTime(content = "") {
  const textLength = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    .length;

  if (textLength < 1000) {
    return "A few seconds read";
  }

  return `${Math.max(1, Math.round(textLength / 1000))} min read`;
}

function decodeHtmlAttribute(value = "") {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getHtmlAttribute(attributes: string, name: string) {
  const attributePattern = new RegExp(
    `${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>]+))`,
    "i"
  );
  const match = attributePattern.exec(attributes);
  return match ? decodeHtmlAttribute(match[1] ?? match[2] ?? match[3] ?? "") : "";
}

function getSafeExternalUrl(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function getYoutubeVideoId(value?: string) {
  const url = getSafeExternalUrl(value);

  if (!url || !youtubeHosts.has(url.hostname.toLowerCase())) {
    return null;
  }

  const pathParts = url.pathname.split("/").filter(Boolean);
  const videoId =
    url.hostname.toLowerCase() === "youtu.be"
      ? pathParts[0]
      : url.searchParams.get("v") ||
        (["embed", "live", "shorts"].includes(pathParts[0])
          ? pathParts[1]
          : null);

  return videoId && youtubeVideoIdPattern.test(videoId) ? videoId : null;
}

function getPlainHtmlText(value = "") {
  return decodeHtmlAttribute(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function youtubeAnchorToEmbed(anchorHtml: string) {
  const match = anchorHtml.match(/^<a\b([^>]*)>([\s\S]*?)<\/a>$/i);

  if (!match) {
    return null;
  }

  const href = getHtmlAttribute(match[1], "href");
  const videoId = getYoutubeVideoId(href);

  if (!videoId) {
    return null;
  }

  const title = escapeHtml(getPlainHtmlText(match[2]) || "External video");

  return `<figure><iframe src="https://www.youtube.com/embed/${videoId}" title="${title}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen data-link-kind="video" data-source-url="${escapeHtml(href)}"></iframe></figure>`;
}

function renderPostContent(content?: string) {
  const safeContent = content || "<p>No body content.</p>";
  const paragraphWrappedAnchorPattern =
    /<p>\s*(<a\b[^>]*>[\s\S]*?<\/a>)\s*<\/p>/gi;
  const anchorPattern = /<a\b[^>]*>[\s\S]*?<\/a>/gi;

  return safeContent
    .replace(paragraphWrappedAnchorPattern, (match, anchorHtml: string) => {
      return youtubeAnchorToEmbed(anchorHtml) || match;
    })
    .replace(anchorPattern, (match) => youtubeAnchorToEmbed(match) || match);
}

function getMediaSummary(post: TownHallPost) {
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

function LocationChips({ post }: Readonly<{ post: TownHallPost }>) {
  const locations = [post.county, post.city].filter(Boolean);

  if (locations.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {locations.map((location) => (
        <span
          key={location}
          className="rounded-md border border-[#9333EA] bg-[#eeeeee] px-3 py-1 text-sm font-semibold text-[#9333EA]"
        >
          {location}
        </span>
      ))}
    </div>
  );
}

function StateChip({ state }: Readonly<{ state?: string }>) {
  if (!state) {
    return null;
  }

  return (
    <span className="rounded-md border border-[#9333EA] bg-[#eeeeee] px-3 py-1 text-sm font-semibold text-[#9333EA]">
      {state}
    </span>
  );
}

function MediaPills({ post }: Readonly<{ post: TownHallPost }>) {
  const summary = getMediaSummary(post);
  const pills: Array<{ icon?: typeof FileTextIcon; label: string }> = [];

  if (summary.documents) {
    pills.push({ icon: FileTextIcon, label: `${summary.documents} document` });
  }

  if (pills.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((pill) => {
        const Icon = pill.icon;

        return (
          <span
            key={pill.label}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#c4c4c4] bg-[#f7f7f7] px-2.5 py-1 text-sm font-semibold text-[#333333]"
          >
            {Icon ? (
              <Icon className="size-4 text-[#9333EA]" aria-hidden="true" />
            ) : null}
            {pill.label}
          </span>
        );
      })}
    </div>
  );
}

async function fetchPosts(path: string) {
  try {
    const response = await fetch(serverApiUrl(path), {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as PostsResponse;
    return data.posts || [];
  } catch {
    return [];
  }
}

async function getPost(postSlug: string) {
  const posts = await fetchPosts(`/post/getposts?slug=${encodeURIComponent(postSlug)}`);
  return posts[0] || null;
}

async function getRecentPosts(currentSlug: string) {
  const posts = await fetchPosts("/post/getposts?limit=4");
  return posts.filter((post) => post.slug !== currentSlug).slice(0, 3);
}

function EmptyState() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <section className="w-full max-w-xl rounded-md border border-[#999999] bg-[#f7f7f7] p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
          <h1 className="text-2xl font-semibold text-[#B91C1C]">
            Error loading post.
          </h1>
          <p className="mt-3 text-[#4d4d4d]">
            The post you are trying to access does not exist or is unavailable.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-md border border-[#9333EA] px-4 py-2 font-semibold text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 hover:bg-[#eeeeee]"
          >
            Go back to home
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function RecentPostCard({ post }: Readonly<{ post: TownHallPost }>) {
  const authorId = getAuthorId(post);
  const mediaSummary = getMediaSummary(post);

  return (
    <article className="flex min-h-48 flex-col rounded-md border border-[#999999] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
      <div className="flex items-center gap-2 text-sm text-[#4d4d4d]">
        {authorId ? (
          <span className="flex size-7 overflow-hidden rounded-full border border-[#9333EA] bg-[#eeeeee]">
            <ServerPixelAvatar
              seed={authorId}
              alt=""
              size={28}
              className="size-full object-cover [image-rendering:pixelated]"
            />
          </span>
        ) : null}
        <span className="min-w-0 truncate font-semibold text-[#000000]">
          @{post.username || "anonymous"}
        </span>
      </div>

      <h3 className="mt-4 line-clamp-3 text-base font-semibold leading-6 text-[#000000]">
        {post.title || "Untitled post"}
      </h3>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-sm">
        <div className="flex gap-2 text-[#9333EA]">
          {mediaSummary.documents ? <FileTextIcon className="size-4" /> : null}
        </div>
        <Link
          href={`/post/${post.slug}`}
          className="font-semibold text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 hover:text-[#7E22CE]"
        >
          Read
        </Link>
      </div>
    </article>
  );
}

export default async function PostPage({
  params,
}: Readonly<{
  params: Promise<{ postSlug: string }>;
}>) {
  const { postSlug } = await params;
  const post = await getPost(postSlug);

  if (!post || post.isPublishable === false) {
    return <EmptyState />;
  }

  const recentPosts = await getRecentPosts(post.slug);
  const authorId = getAuthorId(post);
  const statusBadges = getStatusBadges(getAuthorStatus(post));
  const contentHtml = renderPostContent(post.content);

  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0 rounded-md border border-[#999999] bg-[#f7f7f7] shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
            <header className="border-b border-[#c4c4c4] p-4 sm:p-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 hover:text-[#7E22CE]"
              >
                <ArrowLeftIcon className="size-4" aria-hidden="true" />
                Home
              </Link>

              <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#000000] sm:text-4xl">
                {post.title || "Untitled post"}
              </h1>

              <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  {authorId ? (
                    <span className="flex size-11 shrink-0 overflow-hidden rounded-full border-2 border-[#9333EA] bg-[#eeeeee] shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
                      <ServerPixelAvatar
                        seed={authorId}
                        alt={`${post.username || "User"} avatar`}
                        size={44}
                        priority
                        className="size-full object-cover [image-rendering:pixelated]"
                      />
                    </span>
                  ) : null}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="break-words text-lg font-semibold text-[#000000]">
                        @{post.username || "anonymous"}
                      </span>
                      {statusBadges.map((badge) => (
                        <StatusBadge key={badge.label} {...badge} />
                      ))}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[#4d4d4d]">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDaysIcon className="size-4" aria-hidden="true" />
                        {formatDate(post.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3Icon className="size-4" aria-hidden="true" />
                        {getReadingTime(post.content)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                  <StateChip state={post.state} />
                  <PostDeleteButton postAuthorId={authorId} postId={post._id} />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <LocationChips post={post} />
                <MediaPills post={post} />
              </div>
            </header>

            <div
              className="px-4 py-6 text-base leading-8 text-[#000000] sm:px-6 [&_a]:font-semibold [&_a]:text-[#9333EA] [&_a]:underline [&_a]:decoration-[#808080] [&_a]:decoration-2 [&_a]:underline-offset-4 [&_em]:italic [&_figure]:my-5 [&_iframe]:block [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-md [&_iframe]:border [&_iframe]:border-[#999999] [&_iframe]:bg-[#000000] [&_img]:max-h-[560px] [&_img]:w-full [&_img]:rounded-md [&_img]:border [&_img]:border-[#999999] [&_img]:bg-[#eeeeee] [&_img]:object-contain [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:mb-4 [&_strong]:font-bold"
              dangerouslySetInnerHTML={{
                __html: contentHtml,
              }}
            />
            <CommentsSection postId={post._id} postSlug={post.slug} />
          </article>

          <aside className="space-y-4">
            <section className="rounded-md border border-[#999999] bg-[#eeeeee] p-4">
              <h2 className="text-lg font-semibold text-[#000000]">Recent Posts</h2>
              <div className="mt-4 grid gap-3">
                {recentPosts.length > 0 ? (
                  recentPosts.map((recentPost) => (
                    <RecentPostCard key={recentPost._id} post={recentPost} />
                  ))
                ) : (
                  <div className="min-h-32 rounded-md border border-[#999999] bg-[#f7f7f7]" />
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
