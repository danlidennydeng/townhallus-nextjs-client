"use client";

import Link from "next/link";
import { FileTextIcon, LogInIcon, MessageSquareTextIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import DashCommentClient, {
  dashCommentPageSize,
  type DashCommentRecord,
} from "@/app/dashcomments/dash-comment-client";
import DashCommentLoading from "@/app/dashcomments/loading";
import DashPostClient, {
  dashPostPageSize,
  type DashPostRecord,
} from "@/app/dashposts/dash-post-client";
import DashPostLoading from "@/app/dashposts/loading";
import DashProfileClient from "@/app/dashprofile/dash-profile-client";
import type { DashboardSection } from "@/components/dashboard-page";
import {
  SiteFooter,
  SiteHeaderContent,
} from "@/components/site-chrome-content";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-client";
import { getStoredUser } from "@/lib/auth-client";

type Collection = "posts" | "comments";

type CollectionResponse = {
  posts?: DashPostRecord[];
  totalPosts?: number;
  comments?: DashCommentRecord[];
  totalComments?: number;
};

type CollectionState = {
  loading: boolean;
  userId: string | null;
  failed: boolean;
  data: CollectionResponse;
};

function useDashboardCollection(collection: Collection) {
  const [state, setState] = useState<CollectionState>({
    loading: true,
    userId: null,
    failed: false,
    data: {},
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadCollection() {
      let userId = getStoredUser()?._id || null;

      try {
        const sessionResponse = await fetch("/api/dashboard-session", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!sessionResponse.ok) {
          throw new Error("Dashboard session could not be loaded.");
        }

        const session = (await sessionResponse.json()) as { userId?: string | null };
        userId = session.userId || null;

        if (controller.signal.aborted) {
          return;
        }

        if (!userId) {
          setState({ loading: false, userId: null, failed: false, data: {} });
          return;
        }

        const params = new URLSearchParams({
          limit: String(collection === "posts" ? dashPostPageSize : dashCommentPageSize),
          startIndex: "0",
        });

        if (collection === "posts") {
          params.set("userId", userId);
        }

        const path = collection === "posts"
          ? `/post/getposts?${params.toString()}`
          : `/comment/getUserComments/${userId}?${params.toString()}`;

        const response = await fetch(apiUrl(path), {
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Dashboard data could not be loaded.");
        }

        const data = (await response.json()) as CollectionResponse;

        if (!controller.signal.aborted) {
          setState({ loading: false, userId, failed: false, data });
        }
      } catch {
        if (!controller.signal.aborted) {
          setState({ loading: false, userId, failed: true, data: {} });
        }
      }
    }

    void loadCollection();

    return () => controller.abort();
  }, [collection]);

  return state;
}

function DashboardShell({
  children,
  userId,
}: Readonly<{ children: ReactNode; userId?: string }>) {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeaderContent serverUserId={userId} />
      {children}
      <SiteFooter />
    </div>
  );
}

function LoginRequired({ collection }: Readonly<{ collection: Collection }>) {
  const Icon = collection === "posts" ? FileTextIcon : MessageSquareTextIcon;
  const label = collection === "posts" ? "My Posts" : "My Comments";

  return (
    <DashboardShell>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <section className="w-full max-w-xl rounded-md border border-[#999999] bg-[#f7f7f7] p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
          <span className="mx-auto flex size-14 items-center justify-center rounded-md border border-[#9333EA] bg-[#eeeeee] text-[#9333EA]">
            <Icon className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-[#000000]">
            Log in to view {label}.
          </h1>
          <Button
            nativeButton={false}
            render={<Link href="/log-in" />}
            className="mt-5 bg-[#9333EA] text-[#ffffff] hover:bg-[#7E22CE]"
          >
            <LogInIcon className="size-4" aria-hidden="true" />
            Log In
          </Button>
        </section>
      </main>
    </DashboardShell>
  );
}

function PostsDashboard() {
  const { loading, userId, failed, data } = useDashboardCollection("posts");

  if (loading) {
    return <DashPostLoading />;
  }

  if (!userId) {
    return <LoginRequired collection="posts" />;
  }

  const posts = data.posts || [];
  const totalPosts = typeof data.totalPosts === "number" ? data.totalPosts : posts.length;

  return (
    <DashboardShell userId={userId}>
      <DashPostClient
        initialFetchFailed={failed}
        initialHasMore={totalPosts > posts.length}
        initialPosts={posts}
        initialTotalPosts={totalPosts}
        userId={userId}
      />
    </DashboardShell>
  );
}

function CommentsDashboard() {
  const { loading, userId, failed, data } = useDashboardCollection("comments");

  if (loading) {
    return <DashCommentLoading />;
  }

  if (!userId) {
    return <LoginRequired collection="comments" />;
  }

  const comments = data.comments || [];
  const totalComments = typeof data.totalComments === "number"
    ? data.totalComments
    : comments.length;

  return (
    <DashboardShell userId={userId}>
      <DashCommentClient
        initialComments={comments}
        initialFetchFailed={failed}
        initialHasMore={totalComments > comments.length}
        initialTotalComments={totalComments}
        userId={userId}
      />
    </DashboardShell>
  );
}

export default function DashboardClient({
  section,
}: Readonly<{ section: DashboardSection }>) {
  if (section === "posts") {
    return <PostsDashboard />;
  }

  if (section === "comments") {
    return <CommentsDashboard />;
  }

  return (
    <DashboardShell>
      <DashProfileClient />
    </DashboardShell>
  );
}
