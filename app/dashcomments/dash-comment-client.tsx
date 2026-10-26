"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  InboxIcon,
  LoaderCircleIcon,
  MessageSquareTextIcon,
  PenLineIcon,
  Trash2Icon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-client";
import type { TownHallUser } from "@/lib/auth-client";
import { pixelAvatarPath } from "@/lib/avatar";

export const dashCommentPageSize = 9;
const commentPreviewMaxLength = 560;

type CommentUser =
  | string
  | {
      _id?: string;
      isAdmin?: boolean;
      isCitizen?: boolean;
      isCommenter?: boolean;
      isPoster?: boolean;
      isVoter?: boolean;
    };

export type DashCommentRecord = {
  _id: string;
  ccontent?: string;
  createdAt?: string;
  isPublishable?: boolean;
  numberOfLikes?: number;
  parentCommentId?: string | null;
  postId?: string;
  postSlug?: string;
  updatedAt?: string;
  userId?: CommentUser;
  username?: string;
};

type CommentsResponse = {
  comments?: DashCommentRecord[];
  totalComments?: number;
};

type StatusBadgeConfig = {
  label: string;
  rounded: "full" | "md";
  title: string;
};

type DashCommentClientProps = {
  initialComments: DashCommentRecord[];
  initialFetchFailed?: boolean;
  initialHasMore: boolean;
  initialTotalComments: number;
  userId: string;
};

function getCommentUserId(comment: DashCommentRecord) {
  if (!comment.userId) {
    return "";
  }

  return typeof comment.userId === "string"
    ? comment.userId
    : comment.userId._id || "";
}

function getCommentUserStatus(comment: DashCommentRecord) {
  return typeof comment.userId === "object" && comment.userId
    ? comment.userId
    : {};
}

function getStatusBadges(status: Partial<TownHallUser>): StatusBadgeConfig[] {
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

function getCommentPreview(content?: string) {
  const text = (content || "").replace(/\s+/g, " ").trim();

  if (!text) {
    return "No comment content.";
  }

  return text.length > commentPreviewMaxLength
    ? `${text.slice(0, commentPreviewMaxLength).trim()}...`
    : text;
}

async function readResponseMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message;
  } catch {
    return undefined;
  }
}

function Notice({ message }: Readonly<{ message?: string }>) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="flex items-start gap-2 rounded-md border border-[#B91C1C] bg-[#f7f7f7] px-4 py-3 text-sm font-semibold text-[#B91C1C]"
      aria-live="polite"
    >
      <TriangleAlertIcon
        className="mt-0.5 size-4 shrink-0 text-[#B91C1C]"
        aria-hidden="true"
      />
      <span>{message}</span>
    </div>
  );
}

function DashCommentCard({
  comment,
  onDeleteRequest,
}: Readonly<{
  comment: DashCommentRecord;
  onDeleteRequest: (commentId: string) => void;
}>) {
  const commentUserId = getCommentUserId(comment);
  const statusBadges = getStatusBadges(getCommentUserStatus(comment));

  return (
    <article className="flex min-h-[465px] w-full min-w-0 max-w-full flex-col overflow-hidden rounded-md border border-[#999999] bg-[#f7f7f7] px-4 pt-3 pb-2 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
      <div className="flex items-start justify-between gap-3 border-b border-[#c4c4c4] pb-2">
        <div className="flex min-w-0 items-center gap-1.5 text-sm text-[#4d4d4d]">
          <CalendarDaysIcon className="size-4 shrink-0" aria-hidden="true" />
          <span>{formatDate(comment.createdAt)}</span>
        </div>
        <button
          type="button"
          aria-label="Delete comment"
          title="Delete comment"
          onClick={() => onDeleteRequest(comment._id)}
          className="inline-flex shrink-0 items-center text-[#B91C1C] transition-colors hover:text-[#7F1D1D]"
        >
          <Trash2Icon className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-hidden">
        <p className="max-h-[360px] overflow-hidden break-words text-sm font-semibold leading-snug text-[#000000] sm:text-base">
          {getCommentPreview(comment.ccontent)}
        </p>
      </div>

      <div className="mt-2 shrink-0 border-t border-[#c4c4c4] pt-2 text-sm">
        <div className="flex min-w-0 items-center gap-3">
          {commentUserId ? (
            <span className="flex size-11 shrink-0 overflow-hidden rounded-full border border-[#9333EA] bg-[#eeeeee] shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
              <Image
                src={pixelAvatarPath(commentUserId)}
                alt={`${comment.username || "User"} avatar`}
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
                @{comment.username || "anonymous"}
              </span>
              {statusBadges.map((badge) => (
                <StatusBadge key={badge.label} {...badge} />
              ))}
            </div>
          </div>
        </div>

        {comment.postSlug ? (
          <Link
            href={`/post/${comment.postSlug}`}
            className="mt-1 flex min-w-0 justify-end gap-1.5 text-right text-sm font-semibold leading-5 text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 hover:text-[#7E22CE]"
          >
            Open
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <p className="mt-1 text-right text-sm font-semibold leading-5 text-[#B91C1C]">
            Original post deleted
          </p>
        )}
      </div>
    </article>
  );
}

function EmptyComments() {
  return (
    <section className="rounded-md border border-[#999999] bg-[#f7f7f7] p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
      <span className="mx-auto flex size-14 items-center justify-center rounded-md border border-[#9333EA] bg-[#eeeeee] text-[#9333EA]">
        <InboxIcon className="size-7" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-2xl font-semibold text-[#000000]">
        You have no comments yet.
      </h2>
    </section>
  );
}

export default function DashCommentClient({
  initialComments,
  initialFetchFailed = false,
  initialHasMore,
  initialTotalComments,
  userId,
}: Readonly<DashCommentClientProps>) {
  const [comments, setComments] = useState(initialComments);
  const [totalComments, setTotalComments] = useState(initialTotalComments);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(
    initialFetchFailed ? "Comments could not be loaded." : ""
  );
  const [commentToDelete, setCommentToDelete] = useState<string>();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();

  const shownLabel = useMemo(() => {
    return `${totalComments} ${totalComments === 1 ? "comment" : "comments"}`;
  }, [totalComments]);

  const loadMoreComments = useCallback(async () => {
    if (!hasMore || loadingMore) {
      return;
    }

    setLoadingMore(true);
    setLoadError("");

    try {
      const params = new URLSearchParams({
        limit: String(dashCommentPageSize),
        startIndex: String(comments.length),
      });
      const response = await fetch(
        apiUrl(`/comment/getUserComments/${userId}?${params.toString()}`),
        {
          credentials: "include",
          method: "GET",
        }
      );

      if (!response.ok) {
        setLoadError("More comments could not be loaded.");
        return;
      }

      const data = (await response.json()) as CommentsResponse;
      const nextComments = data.comments || [];
      const nextTotalComments =
        typeof data.totalComments === "number"
          ? data.totalComments
          : totalComments;
      const currentIds = new Set(comments.map((comment) => comment._id));
      const mergedComments = [
        ...comments,
        ...nextComments.filter((comment) => !currentIds.has(comment._id)),
      ];

      setComments(mergedComments);
      setTotalComments(nextTotalComments);
      setHasMore(nextTotalComments > mergedComments.length);
    } catch {
      setLoadError("More comments could not be loaded.");
    } finally {
      setLoadingMore(false);
    }
  }, [comments, hasMore, loadingMore, totalComments, userId]);

  async function handleDeleteComment() {
    if (!commentToDelete) {
      return;
    }

    setDeleteLoading(true);
    setDeleteError(undefined);

    try {
      const response = await fetch(
        apiUrl(`/comment/deleteComment/${commentToDelete}`),
        {
          credentials: "include",
          method: "DELETE",
        }
      );

      if (!response.ok) {
        setDeleteError(
          (await readResponseMessage(response)) || "Comment could not be deleted."
        );
        return;
      }

      const wasLoaded = comments.some((comment) => comment._id === commentToDelete);
      const nextComments = comments.filter(
        (comment) => comment._id !== commentToDelete
      );
      const nextTotalComments = wasLoaded
        ? Math.max(0, totalComments - 1)
        : totalComments;

      setComments(nextComments);
      setTotalComments(nextTotalComments);
      setHasMore(nextTotalComments > nextComments.length);
      setCommentToDelete(undefined);
    } catch {
      setDeleteError("Comment could not be deleted.");
    } finally {
      setDeleteLoading(false);
    }
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
              My Comments
            </h1>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex h-10 items-center gap-2 rounded-md border border-[#999999] bg-[#eeeeee] px-3 text-sm font-semibold text-[#000000]">
              <MessageSquareTextIcon
                className="size-4 text-[#9333EA]"
                aria-hidden="true"
              />
              {shownLabel}
            </span>
            <Button
              nativeButton={false}
              render={<Link href="/create-post" />}
              className="h-10 bg-[#9333EA] text-[#ffffff] hover:bg-[#7E22CE]"
            >
              <PenLineIcon className="size-4" aria-hidden="true" />
              Create A Post
            </Button>
          </div>
        </section>

        <Notice message={loadError} />

        {comments.length === 0 ? (
          <EmptyComments />
        ) : (
          <section
            aria-label="My comments"
            className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {comments.map((comment) => (
              <DashCommentCard
                key={comment._id}
                comment={comment}
                onDeleteRequest={(commentId) => {
                  setDeleteError(undefined);
                  setCommentToDelete(commentId);
                }}
              />
            ))}
          </section>
        )}

        {hasMore ? (
          <section className="flex justify-end rounded-md border border-[#999999] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
            {loadingMore ? (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#4d4d4d]">
                <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                Loading comments
              </span>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void loadMoreComments();
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

      {commentToDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/45 px-4"
          role="presentation"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dash-comment-title"
            className="w-full max-w-md rounded-md border border-[#999999] bg-[#f7f7f7] p-5 text-center shadow-[0_12px_32px_rgba(0,0,0,0.28)]"
          >
            <div className="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-[#9333EA] bg-[#eeeeee]">
              <TriangleAlertIcon className="size-7 text-[#9333EA]" />
            </div>
            <h2
              id="delete-dash-comment-title"
              className="mt-4 text-lg font-semibold text-[#000000]"
            >
              Are you sure you want to delete this comment?
            </h2>
            <div className="mt-3">
              <Notice message={deleteError} />
            </div>
            <div className="mt-5 flex justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={deleteLoading}
                onClick={handleDeleteComment}
                className="border-[#B91C1C] bg-transparent text-[#B91C1C]"
              >
                {deleteLoading ? (
                  <LoaderCircleIcon className="size-4 animate-spin" />
                ) : (
                  <Trash2Icon className="size-4" />
                )}
                Yes
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={deleteLoading}
                onClick={() => {
                  setDeleteError(undefined);
                  setCommentToDelete(undefined);
                }}
                className="border-[#9333EA] bg-transparent text-[#000000]"
              >
                <XIcon className="size-4" />
                No
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
