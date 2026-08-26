import type { Metadata } from "next";
import Link from "next/link";
import { LogInIcon, MessageSquareTextIcon } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { serverApiUrl } from "@/lib/api-server";
import { getAuthUserIdFromCookie } from "@/lib/auth-server";
import DashCommentClient, {
  dashCommentPageSize,
  type DashCommentRecord,
} from "./dash-comment-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "My Comments | TownHallUS.com",
  description: "Review comments published from your TownHallUS account.",
};

type CommentsResponse = {
  comments?: DashCommentRecord[];
  totalComments?: number;
};

async function fetchUserComments(userId: string) {
  const params = new URLSearchParams({
    limit: String(dashCommentPageSize),
    startIndex: "0",
  });

  try {
    const response = await fetch(
      serverApiUrl(`/comment/getUserComments/${userId}?${params.toString()}`),
      { cache: "no-store" }
    );

    if (!response.ok) {
      return { comments: [], failed: true, totalComments: 0 };
    }

    const data = (await response.json()) as CommentsResponse;
    const comments = data.comments || [];

    return {
      comments,
      failed: false,
      totalComments:
        typeof data.totalComments === "number" ? data.totalComments : comments.length,
    };
  } catch {
    return { comments: [], failed: true, totalComments: 0 };
  }
}

function LoginRequired() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <section className="w-full max-w-xl rounded-md border border-[#999999] bg-[#f7f7f7] p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
          <span className="mx-auto flex size-14 items-center justify-center rounded-md border border-[#9333EA] bg-[#eeeeee] text-[#9333EA]">
            <MessageSquareTextIcon className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-[#000000]">
            Log in to view My Comments.
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
      <SiteFooter />
    </div>
  );
}

export default async function DashCommentPage() {
  const serverUserId = await getAuthUserIdFromCookie();

  if (!serverUserId) {
    return <LoginRequired />;
  }

  const { comments, failed, totalComments } = await fetchUserComments(serverUserId);

  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />
      <DashCommentClient
        initialComments={comments}
        initialFetchFailed={failed}
        initialHasMore={totalComments > comments.length}
        initialTotalComments={totalComments}
        userId={serverUserId}
      />
      <SiteFooter />
    </div>
  );
}
