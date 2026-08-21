"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircleIcon,
  Trash2Icon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-client";
import {
  getStoredUserSnapshot,
  parseStoredUserSnapshot,
  subscribeToAuthChanges,
} from "@/lib/auth-client";

const serverAuthSnapshot = "__townhallus_server_auth_snapshot__";

async function readResponseMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message;
  } catch {
    return undefined;
  }
}

export default function PostDeleteButton({
  postAuthorId,
  postId,
}: Readonly<{
  postAuthorId: string;
  postId: string;
}>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
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
  const canDelete =
    Boolean(currentUser?._id) &&
    (currentUser?._id === postAuthorId || Boolean(currentUser?.isAdmin));

  if (!canDelete) {
    return null;
  }

  async function handleDelete() {
    if (!currentUser?._id) {
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch(
        apiUrl(`/post/deletepost/${postId}/${currentUser._id}`),
        {
          credentials: "include",
          method: "DELETE",
        }
      );

      if (!response.ok) {
        setError((await readResponseMessage(response)) || "Post could not be deleted.");
        return;
      }

      setOpen(false);
      router.push("/create-post");
      router.refresh();
    } catch {
      setError("Post could not be deleted.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Delete post"
        title="Delete post"
        onClick={() => {
          setOpen(true);
          setError(undefined);
        }}
        className="size-10 border-[#B91C1C] bg-transparent text-[#B91C1C]"
      >
        <Trash2Icon className="size-5" aria-hidden="true" />
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/45 px-4"
          role="presentation"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-post-title"
            className="w-full max-w-md rounded-md border border-[#999999] bg-[#f7f7f7] p-5 text-center shadow-[0_12px_32px_rgba(0,0,0,0.28)]"
          >
            <div className="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-[#9333EA] bg-[#eeeeee]">
              <TriangleAlertIcon className="size-7 text-[#9333EA]" />
            </div>
            <h2
              id="delete-post-title"
              className="mt-4 text-lg font-semibold text-[#000000]"
            >
              Are you sure you want to delete this post?
            </h2>
            {error ? (
              <p className="mt-3 rounded-md border border-[#B91C1C] bg-[#eeeeee] px-3 py-2 text-sm font-semibold text-[#B91C1C]">
                {error}
              </p>
            ) : null}
            <div className="mt-5 flex justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleDelete}
                className="border-[#B91C1C] bg-transparent text-[#B91C1C]"
              >
                {loading ? (
                  <LoaderCircleIcon className="size-4 animate-spin" />
                ) : (
                  <Trash2Icon className="size-4" />
                )}
                Yes
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => setOpen(false)}
                className="border-[#9333EA] bg-transparent text-[#000000]"
              >
                <XIcon className="size-4" />
                No
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
