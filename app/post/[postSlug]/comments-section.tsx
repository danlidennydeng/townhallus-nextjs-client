"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LoaderCircleIcon,
  MessageSquareIcon,
  MessageSquareReplyIcon,
  ThumbsUpIcon,
  Trash2Icon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-client";
import { pixelAvatarPath } from "@/lib/avatar";
import {
  getStoredUserSnapshot,
  parseStoredUserSnapshot,
  subscribeToAuthChanges,
  type TownHallUser,
} from "@/lib/auth-client";

const maxCommentDepth = 3;
const maxCommentLength = 560;
const serverAuthSnapshot = "__townhallus_server_auth_snapshot__";

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

type TownHallComment = {
  _id: string;
  ccontent?: string;
  createdAt?: string;
  likes?: string[];
  numberOfLikes?: number;
  parentCommentId?: string | null;
  replies?: TownHallComment[];
  userId?: CommentUser;
  username?: string;
};

type CommentsResponse = {
  comments?: TownHallComment[];
};

type StatusBadgeConfig = {
  label: string;
  rounded: "full" | "md";
  title: string;
};

function getCommentUserId(comment: TownHallComment) {
  if (!comment.userId) {
    return "";
  }

  return typeof comment.userId === "string"
    ? comment.userId
    : comment.userId._id || "";
}

function getCommentUserStatus(comment: TownHallComment) {
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
      className={`flex size-6 items-center justify-center border-2 border-[#9333EA] text-xs font-bold text-[#9333EA] ${
        rounded === "full" ? "rounded-full" : "rounded-md"
      }`}
    >
      {label}
    </span>
  );
}

function normalizeComment(comment: TownHallComment): TownHallComment {
  const likes = (comment.likes || []).map((like) => like.toString());

  return {
    ...comment,
    likes,
    numberOfLikes: comment.numberOfLikes ?? likes.length,
    replies: (comment.replies || []).map(normalizeComment),
  };
}

function withCurrentUserInfo(
  comment: TownHallComment,
  currentUser: TownHallUser
): TownHallComment {
  return {
    ...comment,
    username: currentUser.username,
    userId: {
      _id: currentUser._id,
      isAdmin: currentUser.isAdmin,
      isCitizen: currentUser.isCitizen,
      isCommenter: currentUser.isCommenter,
      isPoster: currentUser.isPoster,
      isVoter: currentUser.isVoter,
    },
  };
}

function updateCommentById(
  comments: TownHallComment[],
  commentId: string,
  updater: (comment: TownHallComment) => TownHallComment
): TownHallComment[] {
  return comments.map((comment) => {
    if (comment._id === commentId) {
      return normalizeComment(updater(comment));
    }

    return {
      ...comment,
      replies: updateCommentById(comment.replies || [], commentId, updater),
    };
  });
}

function addReplyToComment(
  comments: TownHallComment[],
  parentCommentId: string,
  reply: TownHallComment
): TownHallComment[] {
  return comments.map((comment) =>
    comment._id === parentCommentId
      ? { ...comment, replies: [reply, ...(comment.replies || [])] }
      : {
          ...comment,
          replies: addReplyToComment(comment.replies || [], parentCommentId, reply),
        }
  );
}

function removeCommentById(
  comments: TownHallComment[],
  commentId: string
): TownHallComment[] {
  return comments
    .filter((comment) => comment._id !== commentId)
    .map((comment) => ({
      ...comment,
      replies: removeCommentById(comment.replies || [], commentId),
    }));
}

function getTotalCommentCount(comments: TownHallComment[]): number {
  return comments.reduce(
    (total, comment) => total + 1 + getTotalCommentCount(comment.replies || []),
    0
  );
}

function getUniqueUserCount(comments: TownHallComment[]) {
  const userIds = new Set<string>();

  function collect(commentList: TownHallComment[]) {
    commentList.forEach((comment) => {
      const userId = getCommentUserId(comment);

      if (userId) {
        userIds.add(userId);
      }

      collect(comment.replies || []);
    });
  }

  collect(comments);

  return userIds.size;
}

function formatRelativeTime(value?: string) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "just now";
  }

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const divisions: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
    ["second", 1],
  ];
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const division = divisions.find(([, unitSeconds]) => {
    return Math.abs(seconds) >= unitSeconds || unitSeconds === 1;
  });

  if (!division) {
    return "just now";
  }

  const [unit, unitSeconds] = division;
  return formatter.format(Math.round(seconds / unitSeconds), unit);
}

async function readResponseMessage(response: Response) {
  try {
    const data = (await response.json()) as {
      errors?: Array<{ msg?: string }>;
      message?: string;
    };

    return data.message || data.errors?.[0]?.msg;
  } catch {
    return undefined;
  }
}

function Notice({ message }: Readonly<{ message?: string }>) {
  if (!message) {
    return null;
  }

  return (
    <div className="flex items-start gap-2 rounded-md border border-[#B91C1C] bg-[#eeeeee] px-3 py-2 text-sm leading-5 text-[#B91C1C]">
      <TriangleAlertIcon
        className="mt-0.5 size-4 shrink-0 text-[#B91C1C]"
        aria-hidden="true"
      />
      <span>{message}</span>
    </div>
  );
}

function CommentAvatar({
  seed,
  username,
}: Readonly<{
  seed: string;
  username?: string;
}>) {
  return (
    <span className="flex size-8 shrink-0 overflow-hidden rounded-full border border-[#9333EA] bg-[#eeeeee]">
      <Image
        src={pixelAvatarPath(seed)}
        alt={`${username || "User"} avatar`}
        width={32}
        height={32}
        unoptimized
        className="size-full object-cover [image-rendering:pixelated]"
      />
    </span>
  );
}

function CommentComposer({
  avatarUser,
  error,
  onCancel,
  onSubmit,
  onValueChange,
  placeholder,
  submitLabel = "Submit",
  submitting,
  value,
}: Readonly<{
  avatarUser?: TownHallUser | null;
  error?: string;
  onCancel?: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onValueChange: (value: string) => void;
  placeholder: string;
  submitLabel?: string;
  submitting?: boolean;
  value: string;
}>) {
  const charactersRemaining = maxCommentLength - value.length;

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-[#999999] bg-[#eeeeee] p-3"
    >
      {avatarUser?._id ? (
        <div className="mb-3 flex min-w-0 items-center gap-2 text-sm">
          <CommentAvatar seed={avatarUser._id} username={avatarUser.username} />
          <Link
            href="/dashprofile"
            className="min-w-0 truncate font-semibold text-[#000000] underline decoration-[#808080] decoration-2 underline-offset-4 hover:text-[#7E22CE]"
          >
            @{avatarUser.username || "anonymous"}
          </Link>
          <div className="flex flex-wrap gap-1">
            {getStatusBadges(avatarUser).map((badge) => (
              <StatusBadge key={badge.label} {...badge} />
            ))}
          </div>
        </div>
      ) : null}

      <textarea
        value={value}
        maxLength={maxCommentLength}
        rows={4}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className="block w-full resize-y rounded-md border border-[#999999] bg-[#f7f7f7] px-3 py-2 text-sm leading-6 text-[#000000] outline-none placeholder:text-[#666666] focus:border-[#9333EA]"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={submitting}
            className="h-9 rounded-md border border-[#9333EA] bg-[#9333EA] px-4 text-[#ffffff] hover:bg-[#7E22CE]"
          >
            {submitting ? (
              <LoaderCircleIcon
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : null}
            {submitting ? "Submitting..." : submitLabel}
          </Button>
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={onCancel}
              className="h-9 rounded-md border-[#9333EA] bg-transparent text-[#000000]"
            >
              Cancel
            </Button>
          ) : null}
        </div>
        <p className="text-sm font-semibold text-[#4d4d4d]">
          <span className="text-[#9333EA]">
            {charactersRemaining.toLocaleString()}
          </span>{" "}
          characters remaining
        </p>
      </div>

      <div className="mt-3" aria-live="polite">
        <Notice message={error} />
      </div>
    </form>
  );
}

export default function CommentsSection({
  postId,
  postSlug,
}: Readonly<{
  postId: string;
  postSlug: string;
}>) {
  const router = useRouter();
  const [comments, setComments] = useState<TownHallComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState<string>();
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string>();
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [replyError, setReplyError] = useState<string>();
  const [submittingReplyId, setSubmittingReplyId] = useState<string>();
  const [likingCommentId, setLikingCommentId] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const [commentToDelete, setCommentToDelete] = useState<string>();
  const [deleteError, setDeleteError] = useState<string>();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const storedUserSnapshot = useSyncExternalStore(
    subscribeToAuthChanges,
    getStoredUserSnapshot,
    () => serverAuthSnapshot
  );
  const currentUser = useMemo(
    () =>
      storedUserSnapshot === serverAuthSnapshot
        ? null
        : parseStoredUserSnapshot(storedUserSnapshot),
    [storedUserSnapshot]
  );
  const totalCommentCount = getTotalCommentCount(comments);
  const uniqueUserCount = getUniqueUserCount(comments);

  useEffect(() => {
    let cancelled = false;

    async function getComments() {
      setCommentsLoading(true);
      setActionError(undefined);

      try {
        const response = await fetch(
          apiUrl(`/comment/getPostComments/${postId}`),
          {
            credentials: "include",
            method: "GET",
          }
        );

        if (!response.ok) {
          setActionError(
            (await readResponseMessage(response)) || "Comments could not be loaded."
          );
          return;
        }

        const data = (await response.json()) as CommentsResponse;

        if (!cancelled) {
          setComments((data.comments || []).map(normalizeComment));
        }
      } catch {
        if (!cancelled) {
          setActionError("Comments could not be loaded.");
        }
      } finally {
        if (!cancelled) {
          setCommentsLoading(false);
        }
      }
    }

    getComments();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  function getCommenterUser() {
    if (!currentUser?._id) {
      router.push("/log-in");
      return null;
    }

    if (!currentUser.isCommenter) {
      setActionError("You do not have permission to comment.");
      return null;
    }

    return currentUser;
  }

  function validateCommentContent(value: string) {
    const cleanContent = value.trim();

    if (!cleanContent) {
      return "Comment content cannot be empty.";
    }

    if (cleanContent.length > maxCommentLength) {
      return "Comment content must be under 560 characters.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const commenter = getCommenterUser();

    if (!commenter) {
      return;
    }

    const validationError = validateCommentContent(comment);

    if (validationError) {
      setCommentError(validationError);
      return;
    }

    setCommentSubmitting(true);
    setCommentError(undefined);
    setActionError(undefined);

    try {
      const response = await fetch(apiUrl("/comment/create"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ccontent: comment.trim(),
          postId,
          postSlug,
        }),
      });

      if (!response.ok) {
        setCommentError(
          (await readResponseMessage(response)) || "Comment could not be created."
        );
        return;
      }

      const data = normalizeComment(
        withCurrentUserInfo((await response.json()) as TownHallComment, commenter)
      );

      setComments((current) => [data, ...current]);
      setComment("");
    } catch {
      setCommentError("Comment could not be created.");
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function handleReplySubmit(
    event: FormEvent<HTMLFormElement>,
    parentCommentId: string
  ) {
    event.preventDefault();

    const commenter = getCommenterUser();

    if (!commenter) {
      return;
    }

    const replyContent = replyInputs[parentCommentId] || "";
    const validationError = validateCommentContent(replyContent);

    if (validationError) {
      setReplyError(validationError);
      return;
    }

    setSubmittingReplyId(parentCommentId);
    setReplyError(undefined);
    setActionError(undefined);

    try {
      const response = await fetch(apiUrl("/comment/create"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ccontent: replyContent.trim(),
          parentCommentId,
          postId,
          postSlug,
        }),
      });

      if (!response.ok) {
        setReplyError(
          (await readResponseMessage(response)) || "Reply could not be created."
        );
        return;
      }

      const data = normalizeComment(
        withCurrentUserInfo((await response.json()) as TownHallComment, commenter)
      );

      setComments((current) => addReplyToComment(current, parentCommentId, data));
      setReplyInputs((current) => ({ ...current, [parentCommentId]: "" }));
      setReplyingToCommentId(undefined);
    } catch {
      setReplyError("Reply could not be created.");
    } finally {
      setSubmittingReplyId(undefined);
    }
  }

  async function handleLike(commentId: string) {
    if (!currentUser?._id) {
      router.push("/log-in");
      return;
    }

    setLikingCommentId(commentId);
    setActionError(undefined);

    try {
      const response = await fetch(apiUrl(`/comment/likeComment/${commentId}`), {
        credentials: "include",
        method: "PUT",
      });

      if (!response.ok) {
        setActionError(
          (await readResponseMessage(response)) || "Comment like could not be updated."
        );
        return;
      }

      const data = (await response.json()) as TownHallComment;
      const likes = (data.likes || []).map((like) => like.toString());

      setComments((current) =>
        updateCommentById(current, commentId, (matchedComment) => ({
          ...matchedComment,
          likes,
          numberOfLikes: data.numberOfLikes ?? likes.length,
        }))
      );
    } catch {
      setActionError("Comment like could not be updated.");
    } finally {
      setLikingCommentId(undefined);
    }
  }

  async function handleDeleteComment() {
    if (!commentToDelete) {
      return;
    }

    if (!currentUser?._id) {
      router.push("/log-in");
      return;
    }

    setDeleteLoading(true);
    setDeleteError(undefined);
    setActionError(undefined);

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

      setComments((current) => removeCommentById(current, commentToDelete));
      setReplyingToCommentId(undefined);
      setCommentToDelete(undefined);
    } catch {
      setDeleteError("Comment could not be deleted.");
    } finally {
      setDeleteLoading(false);
    }
  }

  function renderComment(commentItem: TownHallComment, depth = 1) {
    const commentUserId = getCommentUserId(commentItem);
    const canDelete =
      Boolean(currentUser?._id) &&
      (Boolean(currentUser?.isAdmin) || currentUser?._id === commentUserId);
    const canReply = depth < maxCommentDepth;
    const isLiked =
      Boolean(currentUser?._id) &&
      Boolean(commentItem.likes?.includes(currentUser?._id || ""));
    const likeCount = commentItem.numberOfLikes || 0;
    const replyContent = replyInputs[commentItem._id] || "";
    const statusBadges = getStatusBadges(getCommentUserStatus(commentItem));
    const replies = (commentItem.replies || []).slice(0);
    const commentProfileHref =
      commentUserId && commentUserId === currentUser?._id ? "/dashprofile" : null;

    return (
      <div key={commentItem._id} className={depth > 1 ? "pl-4 sm:pl-6" : ""}>
        <article
          className={`relative border-b border-[#c4c4c4] py-4 ${
            depth > 1 ? "border-l-2 border-l-[#c4c4c4] pl-4" : ""
          }`}
        >
          <div className="flex gap-3">
            {commentUserId && commentProfileHref ? (
              <Link
                href={commentProfileHref}
                className="mt-0.5 shrink-0"
                aria-label={`${commentItem.username || "User"} profile`}
              >
                <CommentAvatar
                  seed={commentUserId}
                  username={commentItem.username}
                />
              </Link>
            ) : commentUserId ? (
              <span className="mt-0.5 shrink-0">
                <CommentAvatar
                  seed={commentUserId}
                  username={commentItem.username}
                />
              </span>
            ) : null}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  {commentProfileHref ? (
                    <Link
                      href={commentProfileHref}
                      className="min-w-0 break-words text-sm font-semibold text-[#000000] underline decoration-[#808080] decoration-2 underline-offset-4 hover:text-[#7E22CE]"
                    >
                      @{commentItem.username || "anonymous"}
                    </Link>
                  ) : (
                    <span className="min-w-0 break-words text-sm font-semibold text-[#000000]">
                      @{commentItem.username || "anonymous"}
                    </span>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {statusBadges.map((badge) => (
                      <StatusBadge key={badge.label} {...badge} />
                    ))}
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#666666]">
                  {formatRelativeTime(commentItem.createdAt)}
                </span>
              </div>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#000000]">
                {commentItem.ccontent}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={likingCommentId === commentItem._id}
                    onClick={() => handleLike(commentItem._id)}
                    className={`inline-flex items-center gap-1.5 font-semibold transition-colors hover:text-[#7E22CE] disabled:opacity-60 ${
                      isLiked ? "text-[#7E22CE]" : "text-[#9333EA]"
                    }`}
                  >
                    {likingCommentId === commentItem._id ? (
                      <LoaderCircleIcon
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <ThumbsUpIcon className="size-4" aria-hidden="true" />
                    )}
                    <span>
                      {likeCount > 0
                        ? `${likeCount} ${likeCount === 1 ? "like" : "likes"}`
                        : "Like"}
                    </span>
                  </button>

                  {canReply ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!getCommenterUser()) {
                          return;
                        }

                        setReplyError(undefined);
                        setReplyingToCommentId((current) =>
                          current === commentItem._id ? undefined : commentItem._id
                        );
                      }}
                      className="inline-flex items-center gap-1.5 font-semibold text-[#9333EA] transition-colors hover:text-[#7E22CE]"
                    >
                      <MessageSquareReplyIcon
                        className="size-4"
                        aria-hidden="true"
                      />
                      Reply
                    </button>
                  ) : null}
                </div>

                  {canDelete ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(undefined);
                      setCommentToDelete(commentItem._id);
                    }}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#B91C1C] transition-colors hover:text-[#7F1D1D]"
                  >
                    <Trash2Icon className="size-4" aria-hidden="true" />
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </article>

        {currentUser && replyingToCommentId === commentItem._id ? (
          <div className="mt-3 pl-4 sm:pl-8">
            <CommentComposer
              error={replyError}
              onCancel={() => {
                setReplyError(undefined);
                setReplyingToCommentId(undefined);
              }}
              onSubmit={(event) => handleReplySubmit(event, commentItem._id)}
              onValueChange={(value) =>
                setReplyInputs((current) => ({
                  ...current,
                  [commentItem._id]: value,
                }))
              }
              placeholder="Write a reply. Maximum 560 characters."
              submitLabel="Reply"
              submitting={submittingReplyId === commentItem._id}
              value={replyContent}
            />
          </div>
        ) : null}

        {depth < maxCommentDepth && replies.length > 0 ? (
          <div className="space-y-1">
            {replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section className="border-t border-[#c4c4c4] px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquareIcon className="size-5 text-[#9333EA]" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-[#000000]">Comments</h2>
        </div>
        {totalCommentCount > 0 ? (
          <p className="text-sm font-semibold text-[#4d4d4d]">
            <span className="rounded-md border border-[#999999] bg-[#eeeeee] px-2 py-1 text-[#000000]">
              {totalCommentCount}
            </span>{" "}
            comments by{" "}
            <span className="rounded-md border border-[#999999] bg-[#eeeeee] px-2 py-1 text-[#000000]">
              {uniqueUserCount}
            </span>{" "}
            users
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        {currentUser ? (
          currentUser.isCommenter ? (
            <CommentComposer
              avatarUser={currentUser}
              error={commentError}
              onSubmit={handleSubmit}
              onValueChange={(value) => {
                setComment(value);
                setCommentError(undefined);
              }}
              placeholder="Any comments? Maximum 560 characters."
              submitting={commentSubmitting}
              value={comment}
            />
          ) : (
            <Notice message="You do not have permission to comment." />
          )
        ) : (
          <p className="rounded-md border border-[#999999] bg-[#eeeeee] px-3 py-2 text-sm font-semibold text-[#000000]">
            You must be{" "}
            <Link
              href="/log-in"
              className="text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 hover:text-[#7E22CE]"
            >
              signed in
            </Link>{" "}
            to comment.
          </p>
        )}
      </div>

      <div className="mt-4" aria-live="polite">
        <Notice message={actionError} />
      </div>

      {commentsLoading ? (
        <div className="mt-5 flex items-center gap-2 rounded-md border border-[#999999] bg-[#eeeeee] px-3 py-3 text-sm font-semibold text-[#4d4d4d]">
          <LoaderCircleIcon className="size-4 animate-spin text-[#9333EA]" />
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <p className="mt-5 rounded-md border border-[#999999] bg-[#eeeeee] px-3 py-3 text-sm font-semibold text-[#4d4d4d]">
          Be the first one to comment.
        </p>
      ) : (
        <div className="mt-5">{comments.map((item) => renderComment(item))}</div>
      )}

      {commentToDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/45 px-4"
          role="presentation"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-comment-title"
            className="w-full max-w-md rounded-md border border-[#999999] bg-[#f7f7f7] p-5 text-center shadow-[0_12px_32px_rgba(0,0,0,0.28)]"
          >
            <div className="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-[#9333EA] bg-[#eeeeee]">
              <TriangleAlertIcon className="size-7 text-[#9333EA]" />
            </div>
            <h3
              id="delete-comment-title"
              className="mt-4 text-lg font-semibold text-[#000000]"
            >
              Are you sure you want to delete this comment?
            </h3>
            <div className="mt-3" aria-live="polite">
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
    </section>
  );
}
