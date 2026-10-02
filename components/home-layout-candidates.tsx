import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CircleHelpIcon,
  FileTextIcon,
  ImageIcon,
  LandmarkIcon,
  LogInIcon,
  MapPinnedIcon,
  MessageSquareTextIcon,
  NewspaperIcon,
  PenLineIcon,
  ScaleIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  UsersRoundIcon,
  VideoIcon,
  VoteIcon,
} from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { ServerPixelAvatar } from "@/components/server-pixel-avatar";
import { StateFlagIcon } from "@/components/state-flag";
import { RotatingStateName } from "@/components/home-state-spotlight";
import { serverApiUrl } from "@/lib/api-server";
import { getAuthUserIdFromCookie } from "@/lib/auth-server";

type HomeLayoutVariant = "editorial" | "action" | "state";

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

type HomePost = {
  _id?: string;
  city?: string;
  content?: string;
  county?: string;
  createdAt?: string;
  isPublishable?: boolean;
  mediaLinks?: MediaLink[];
  pictureURL?: string;
  slug?: string;
  state?: string;
  title?: string;
  userId?: string | UserStatus;
  username?: string;
  videoId?: string;
};

type PostsResponse = {
  posts?: HomePost[];
};

type HomeData = {
  isAuthenticated: boolean;
  latestPost: HomePost | null;
  latestPostFailed: boolean;
};

type StatusBadgeConfig = {
  label: string;
  rounded: "full" | "md";
  title: string;
};

const homeImageSrc = "/congress-woman768x432-c.png";

export const homeLayoutMetadata: Metadata = {
  title: "Home Layout Design | TownHallUS.com",
  description:
    "A candidate TownHallUS.com home page layout for civic discussion, state-level conversations, and recent posts.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TownHallUS.com",
  url: "https://www.townhallus.com",
  description:
    "A professional political and social discussion forum for American registered voters and young American citizens.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.townhallus.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const metadataItems = [
  { label: "Audience", value: "Registered voters and citizens ages 13-17" },
  { label: "Scope", value: "National, state, county, and city discussions" },
  { label: "Post Feed", value: "Open visibility across the community" },
];

const civicPillars: ReadonlyArray<{
  description: string;
  icon: LucideIcon;
  title: string;
}> = [
  {
    description:
      "A professional space for Democrats, Republicans, independents, and non-partisans to discuss public life.",
    icon: ScaleIcon,
    title: "Neutral Ground",
  },
  {
    description:
      "Discussion can begin at the state, county, city, or national level, depending on what the issue needs.",
    icon: MapPinnedIcon,
    title: "Local To National",
  },
  {
    description:
      "Posts are designed to be visible across the forum rather than limited to follower-only circles.",
    icon: MessageSquareTextIcon,
    title: "Open Visibility",
  },
];

const actionPaths: ReadonlyArray<{
  description: string;
  href: string;
  icon: LucideIcon;
  title: string;
}> = [
  {
    description:
      "Create an account to participate in civic discussion and build a recognizable forum identity.",
    href: "/create-account",
    icon: UserPlusIcon,
    title: "Create Account",
  },
  {
    description:
      "Start with state-level posts and move from statewide policy into county or city concerns.",
    href: "/mystate/California",
    icon: MapPinnedIcon,
    title: "Visit A State",
  },
  {
    description:
      "Review account, voter status, posting, avatar, and comment questions before joining in.",
    href: "/faqpage",
    icon: CircleHelpIcon,
    title: "Read FAQ",
  },
];

const scopeLevels = [
  { label: "National", value: "Countrywide public issues" },
  { label: "State", value: "Policy close to home" },
  { label: "County", value: "Regional civic impact" },
  { label: "City", value: "Local community decisions" },
];

const stateDirectory = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const primaryActionClassName =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#9333EA] bg-[#9333EA] px-4 text-sm font-semibold text-[#ffffff] no-underline transition-colors hover:bg-[#7E22CE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000000]";

const secondaryActionClassName =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#9333EA] bg-transparent px-4 text-sm font-semibold text-[#9333EA] no-underline transition-colors hover:bg-[#eeeeee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000000]";

function JsonLdScript() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
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

  return text.length > 260 ? `${text.slice(0, 260).trim()}...` : text;
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
  const textLength = getPlainText(content).length;

  if (textLength < 1000) {
    return "Seconds MORE to read";
  }

  return `${Math.max(1, Math.round(textLength / 1000))} min MORE to read`;
}

function getAuthorId(post: HomePost) {
  return typeof post.userId === "string" ? post.userId : post.userId?._id || "";
}

function getAuthorStatus(post: HomePost) {
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

function getMediaSummary(post: HomePost) {
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

async function fetchLatestPost() {
  try {
    const response = await fetch(serverApiUrl("/post/getposts?limit=1"), {
      cache: "no-store",
    });

    if (!response.ok) {
      return { failed: true, post: null };
    }

    const data = (await response.json()) as PostsResponse;
    const post =
      (data.posts || []).find((candidate) => candidate.isPublishable !== false) ||
      null;

    return { failed: false, post };
  } catch {
    return { failed: true, post: null };
  }
}

async function getHomeData(): Promise<HomeData> {
  const [latestPostResult, serverUserId] = await Promise.all([
    fetchLatestPost(),
    getAuthUserIdFromCookie(),
  ]);

  return {
    isAuthenticated: Boolean(serverUserId),
    latestPost: latestPostResult.post,
    latestPostFailed: latestPostResult.failed,
  };
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

function StateChip({ state }: Readonly<{ state?: string }>) {
  if (!state) {
    return null;
  }

  return (
    <Link
      href={`/mystate/${encodeURIComponent(state)}`}
      className="inline-flex items-center gap-1.5 rounded-md border border-[#9333EA] bg-[#eeeeee] px-3 py-1 text-sm font-semibold text-[#9333EA] transition-colors hover:bg-[#d6d6d6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9333EA]"
    >
      <StateFlagIcon state={state} />
      {state}
    </Link>
  );
}

function Section({
  children,
  eyebrow,
  surface = "plain",
  title,
}: Readonly<{
  children: React.ReactNode;
  eyebrow: string;
  surface?: "plain" | "container";
  title: string;
}>) {
  return (
    <section
      className={`border-t border-[#c4c4c4] ${
        surface === "container" ? "bg-[#eeeeee]" : "bg-[#e6e6e6]"
      }`}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-[220px_1fr] lg:px-8 lg:py-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-[#4d4d4d]">
            {eyebrow}
          </p>
          <h2 className="mt-2 max-w-sm text-2xl font-semibold leading-tight tracking-normal text-[#000000] sm:text-3xl">
            {title}
          </h2>
        </div>

        <div className="min-w-0 text-base leading-7 text-[#000000] sm:text-lg sm:leading-8">
          {children}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  description,
  icon: Icon,
  title,
}: Readonly<{
  description: string;
  icon: LucideIcon;
  title: string;
}>) {
  return (
    <article className="rounded-md border border-[#c4c4c4] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[0_3px_8px_rgba(0,0,0,0.16)]">
      <span className="flex size-12 items-center justify-center rounded-md border border-[#9333EA] bg-[#eeeeee]">
        <Icon className="size-6 text-[#9333EA]" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-xl font-semibold leading-snug text-[#000000]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[#1f1f1f]">{description}</p>
    </article>
  );
}

function ActionCard({
  description,
  href,
  icon: Icon,
  title,
}: Readonly<{
  description: string;
  href: string;
  icon: LucideIcon;
  title: string;
}>) {
  return (
    <Link
      href={href}
      className="group rounded-md border border-[#c4c4c4] bg-[#f7f7f7] p-5 text-[#000000] no-underline shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[0_3px_8px_rgba(0,0,0,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000000]"
    >
      <span className="flex size-12 items-center justify-center rounded-md border border-[#9333EA] bg-[#eeeeee]">
        <Icon className="size-6 text-[#9333EA]" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-xl font-semibold leading-snug text-[#000000]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[#1f1f1f]">{description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 group-hover:text-[#7E22CE]">
        Open
        <ArrowRightIcon className="size-4" aria-hidden="true" />
      </span>
    </Link>
  );
}

function MediaIconStrip({ post }: Readonly<{ post: HomePost }>) {
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

function LatestPostCard({
  isAuthenticated,
  latestPostFailed,
  post,
}: Readonly<{
  isAuthenticated: boolean;
  latestPostFailed: boolean;
  post: HomePost | null;
}>) {
  if (!post) {
    return (
      <article className="rounded-md border border-[#999999] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
        <span className="flex size-12 items-center justify-center rounded-md border border-[#9333EA] bg-[#eeeeee]">
          <NewspaperIcon className="size-6 text-[#9333EA]" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-xl font-semibold leading-snug text-[#000000]">
          Latest post is unavailable.
        </h3>
        <p className="mt-3 text-sm leading-6 text-[#1f1f1f]">
          {latestPostFailed
            ? "The post feed could not be loaded right now."
            : "No public posts were found."}
        </p>
        <Link href="/create-account" className={`mt-5 ${primaryActionClassName}`}>
          <PenLineIcon className="size-4" aria-hidden="true" />
          Start A Conversation
        </Link>
      </article>
    );
  }

  const authorId = getAuthorId(post);
  const statusBadges = getStatusBadges(getAuthorStatus(post));
  const postHref = post.slug && isAuthenticated ? `/post/${post.slug}` : "/log-in";
  const actionLabel = isAuthenticated ? getReadingTime(post.content) : "Log In To Read More";
  const ActionIcon = isAuthenticated ? ArrowRightIcon : LogInIcon;

  return (
    <article className="flex min-h-[430px] flex-col rounded-md border border-[#999999] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
      <div className="flex items-start justify-between gap-3 border-b border-[#c4c4c4] pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-[#4d4d4d]">
            Latest Post
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-[#4d4d4d]">
            <CalendarDaysIcon className="size-4" aria-hidden="true" />
            {formatDate(post.createdAt)}
          </div>
        </div>
        <StateChip state={post.state} />
      </div>

      <div className="mt-5 min-h-0 flex-1">
        <h3 className="break-words text-2xl font-semibold leading-tight text-[#000000]">
          {post.title || "Untitled post"}
        </h3>
        <p className="mt-4 text-base leading-7 text-[#333333]">
          {getPostPreview(post.content)}
        </p>
      </div>

      <MediaIconStrip post={post} />

      <div className="mt-5 shrink-0 border-t border-[#c4c4c4] pt-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          {authorId ? (
            <span className="flex size-11 shrink-0 overflow-hidden rounded-full border border-[#9333EA] bg-[#eeeeee] shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
              <ServerPixelAvatar
                seed={authorId}
                alt={`${post.username || "User"} avatar`}
                size={44}
                className="size-full object-cover [image-rendering:pixelated]"
              />
            </span>
          ) : null}
          <span className="min-w-0 break-words text-sm font-semibold text-[#000000]">
            @{post.username || "anonymous"}
          </span>
          {statusBadges.map((badge) => (
            <StatusBadge key={badge.label} {...badge} />
          ))}
        </div>

        <Link href={postHref} className={`mt-5 ${secondaryActionClassName}`}>
          <ActionIcon className="size-4" aria-hidden="true" />
          {actionLabel}
        </Link>
      </div>
    </article>
  );
}

function HeroImagePanel() {
  return (
    <figure className="overflow-hidden rounded-md border border-[#999999] bg-[#eeeeee] shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
      <Image
        src={homeImageSrc}
        alt="A public speaker at a civic event"
        width={768}
        height={432}
        priority
        className="aspect-video w-full object-cover"
      />
      <figcaption className="border-t border-[#c4c4c4] px-4 py-3 text-sm leading-6 text-[#333333]">
        The 2026 midterm election is coming. Be proud to vote and discuss the
        policies that shape your community.
      </figcaption>
    </figure>
  );
}

function MetadataAside() {
  return (
    <aside
      aria-label="Home page details"
      className="min-w-0 w-full max-w-[22rem] border-l-0 border-[#999999] bg-[#eeeeee] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.16)] sm:max-w-none md:border-l md:bg-transparent md:shadow-none"
    >
      <div className="flex items-center gap-4">
        <span className="flex size-16 items-center justify-center rounded-md border border-[#999999] bg-[#ffffff]">
          <LandmarkIcon className="size-9 text-[#666666]" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm text-[#4d4d4d]">Forum</p>
          <p className="font-semibold text-[#9333EA]">TownHallUS.com</p>
        </div>
      </div>

      <dl className="mt-6 divide-y divide-[#c4c4c4]">
        {metadataItems.map((item) => (
          <div
            key={item.label}
            className="grid gap-1 py-3 text-sm sm:grid-cols-[96px_1fr] sm:gap-3"
          >
            <dt className="font-medium text-[#4d4d4d]">{item.label}</dt>
            <dd className="min-w-0 break-words text-[#000000]">{item.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

function HomePageShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />
      <main className="flex-1">
        <JsonLdScript />
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

function EditorialDesign({ data }: Readonly<{ data: HomeData }>) {
  return (
    <HomePageShell>
      <section className="border-b border-[#c4c4c4] bg-[#f7f7f7]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-[minmax(0,1fr)_280px] md:items-center lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-18">
          <div className="min-w-0 w-full max-w-[22rem] sm:max-w-none">
            <p className="text-sm font-semibold uppercase tracking-normal text-[#4d4d4d]">
              Home
            </p>
            <h1 className="mt-3 max-w-full break-words text-3xl font-semibold leading-tight tracking-normal text-[#000000] sm:max-w-4xl sm:text-5xl lg:text-6xl">
              Open, professional, neutral political discussion for the United
              States.
            </h1>
            <p className="mt-5 max-w-full break-words text-lg leading-8 text-[#1f1f1f] sm:max-w-3xl sm:text-xl sm:leading-9">
              TownHallUS.com helps American voters and young American citizens
              discuss the policies and politics of{" "}
              <RotatingStateName className="font-semibold" />
              with room for every side to be seen.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/create-account" className={primaryActionClassName}>
                <UserPlusIcon className="size-4" aria-hidden="true" />
                Create Account
              </Link>
              <Link href="/faqpage" className={secondaryActionClassName}>
                <CircleHelpIcon className="size-4" aria-hidden="true" />
                Read FAQ
              </Link>
            </div>
          </div>

          <MetadataAside />
        </div>
      </section>

      <Section eyebrow="Election" title="Be Proud To Vote" surface="container">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div>
            <HeroImagePanel />
          </div>
          <LatestPostCard
            isAuthenticated={data.isAuthenticated}
            latestPostFailed={data.latestPostFailed}
            post={data.latestPost}
          />
        </div>
      </Section>

      <Section eyebrow="Purpose" title="Why This Forum Exists">
        <div className="grid gap-4 md:grid-cols-3">
          {civicPillars.map((pillar) => (
            <FeatureCard key={pillar.title} {...pillar} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Start" title="Choose A First Step" surface="container">
        <div className="grid gap-4 md:grid-cols-3">
          {actionPaths.map((action) => (
            <ActionCard key={action.title} {...action} />
          ))}
        </div>
      </Section>
    </HomePageShell>
  );
}

function ActionDesign({ data }: Readonly<{ data: HomeData }>) {
  return (
    <HomePageShell>
      <section className="border-b border-[#c4c4c4] bg-[#f7f7f7]">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_430px] lg:px-8 lg:py-18">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-normal text-[#4d4d4d]">
              Home
            </p>
            <h1 className="mt-3 max-w-4xl break-words text-3xl font-semibold leading-tight tracking-normal text-[#000000] sm:text-5xl lg:text-6xl">
              Care about your{" "}
              <RotatingStateName className="font-semibold" />
              policies or politics?
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#1f1f1f] sm:text-xl sm:leading-9">
              Create an account, read recent posts, and join a civic discussion
              built for American public issues from city hall to Congress.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/create-account" className={primaryActionClassName}>
                <UserPlusIcon className="size-4" aria-hidden="true" />
                Yes, Create An Account
              </Link>
              <Link href="/mystate/California" className={secondaryActionClassName}>
                <MapPinnedIcon className="size-4" aria-hidden="true" />
                See State Posts
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {scopeLevels.map((item) => (
                <div
                  key={item.label}
                  className="rounded-md border border-[#c4c4c4] bg-[#eeeeee] px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.10)]"
                >
                  <p className="text-lg font-semibold text-[#000000]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-[#4d4d4d]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <LatestPostCard
            isAuthenticated={data.isAuthenticated}
            latestPostFailed={data.latestPostFailed}
            post={data.latestPost}
          />
        </div>
      </section>

      <section className="border-t border-[#c4c4c4] bg-[#eeeeee]">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
          {actionPaths.map((action) => (
            <ActionCard key={action.title} {...action} />
          ))}
        </div>
      </section>

      <Section eyebrow="Context" title="The Civic Brief">
        <div className="grid gap-6 lg:grid-cols-[390px_minmax(0,1fr)] lg:items-start">
          <HeroImagePanel />
          <div>
            <p>
              The home page can behave like a working dashboard: a direct call
              to join, a live preview of the newest post, and a clear route into
              state-level conversation.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {civicPillars.slice(0, 2).map((pillar) => (
                <FeatureCard key={pillar.title} {...pillar} />
              ))}
            </div>
          </div>
        </div>
      </Section>
    </HomePageShell>
  );
}

function StateDirectoryDesign({ data }: Readonly<{ data: HomeData }>) {
  return (
    <HomePageShell>
      <section className="border-b border-[#c4c4c4] bg-[#f7f7f7]">
        <div className="mx-auto grid w-full max-w-7xl gap-7 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_390px] lg:px-8 lg:py-18">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-normal text-[#4d4d4d]">
              Home
            </p>
            <h1 className="mt-3 max-w-4xl break-words text-3xl font-semibold leading-tight tracking-normal text-[#000000] sm:text-5xl lg:text-6xl">
              Start with your state. Keep the national conversation in view.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#1f1f1f] sm:text-xl sm:leading-9">
              TownHallUS.com gives civic discussion a map: begin with{" "}
              <RotatingStateName className="font-semibold" />
              and move toward the public issues that connect every community.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/mystate/California" className={primaryActionClassName}>
                <MapPinnedIcon className="size-4" aria-hidden="true" />
                Browse State Posts
              </Link>
              <Link href="/create-account" className={secondaryActionClassName}>
                <UserPlusIcon className="size-4" aria-hidden="true" />
                Create Account
              </Link>
            </div>
          </div>

          <HeroImagePanel />
        </div>
      </section>

      <Section eyebrow="States" title="Find A State Conversation" surface="container">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {stateDirectory.map((state) => (
            <Link
              key={state}
              href={`/mystate/${encodeURIComponent(state)}`}
              className="inline-flex min-h-11 items-center justify-between gap-3 rounded-md border border-[#c4c4c4] bg-[#f7f7f7] px-3 py-2 text-sm font-semibold text-[#000000] no-underline shadow-[0_1px_2px_rgba(0,0,0,0.10)] transition-colors hover:bg-[#eeeeee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000000]"
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <StateFlagIcon state={state} />
                <span className="truncate">{state}</span>
              </span>
              <ArrowRightIcon
                className="size-4 shrink-0 text-[#9333EA]"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </Section>

      <Section eyebrow="Feed" title="Newest Conversation">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                description:
                  "Verified status badges help readers understand civic eligibility and forum permissions.",
                icon: ShieldCheckIcon,
                title: "Identity Signals",
              },
              {
                description:
                  "Conversation is organized around geography without losing sight of national impact.",
                icon: VoteIcon,
                title: "Civic Context",
              },
              {
                description:
                  "Members can read posts, reply to ideas, and keep thoughtful discussions moving.",
                icon: UsersRoundIcon,
                title: "Public Dialogue",
              },
            ].map((pillar) => (
              <FeatureCard key={pillar.title} {...pillar} />
            ))}
          </div>
          <LatestPostCard
            isAuthenticated={data.isAuthenticated}
            latestPostFailed={data.latestPostFailed}
            post={data.latestPost}
          />
        </div>
      </Section>
    </HomePageShell>
  );
}

export async function HomeLayoutDesign({
  variant,
}: Readonly<{
  variant: HomeLayoutVariant;
}>) {
  const data = await getHomeData();

  if (variant === "action") {
    return <ActionDesign data={data} />;
  }

  if (variant === "state") {
    return <StateDirectoryDesign data={data} />;
  }

  return <EditorialDesign data={data} />;
}
