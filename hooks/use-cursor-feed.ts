"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { apiUrl } from "@/lib/api-client";
import { cursorFeedPath, type CursorFeedResponse } from "@/lib/cursor-feed";

export function useCursorFeed<T extends { _id: string }>({
  path,
  initialItems,
  initialNextCursor,
  initialTotalItems = initialItems.length,
  initialError = "",
  loadErrorMessage,
}: Readonly<{
  path: string;
  initialItems: T[];
  initialNextCursor: string | null;
  initialTotalItems?: number;
  initialError?: string;
  loadErrorMessage: string;
}>) {
  const [items, setItems] = useState(initialItems);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(initialError);
  const activeRequest = useRef<AbortController | null>(null);
  const deletedIds = useRef(new Set<string>());

  useEffect(() => () => activeRequest.current?.abort(), []);

  const loadMore = useCallback(async () => {
    if (!nextCursor || activeRequest.current) return;

    const controller = new AbortController();
    activeRequest.current = controller;
    const deletionsBeforeRequest = deletedIds.current.size;
    setLoadingMore(true);
    setLoadError("");

    try {
      const response = await fetch(apiUrl(cursorFeedPath(path, nextCursor)), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error("Feed could not be loaded.");

      const data = (await response.json()) as CursorFeedResponse<T>;
      if (controller.signal.aborted) return;
      if (
        !Array.isArray(data.items) ||
        typeof data.hasMore !== "boolean" ||
        (data.hasMore && (
          typeof data.nextCursor !== "string" ||
          !data.nextCursor ||
          data.nextCursor === nextCursor
        ))
      ) {
        throw new Error("Invalid cursor page.");
      }

      setItems((current) => {
        const currentIds = new Set(current.map((item) => item._id));
        return [
          ...current,
          ...data.items.filter((item) => !currentIds.has(item._id) && !deletedIds.current.has(item._id)),
        ];
      });
      if (typeof data.totalItems === "number" && deletionsBeforeRequest === deletedIds.current.size) {
        setTotalItems(data.totalItems);
      }
      setNextCursor(data.hasMore ? data.nextCursor : null);
    } catch {
      if (!controller.signal.aborted) setLoadError(loadErrorMessage);
    } finally {
      activeRequest.current = null;
      if (!controller.signal.aborted) setLoadingMore(false);
    }
  }, [path, nextCursor, loadErrorMessage]);

  function removeItem(id: string) {
    if (deletedIds.current.has(id)) return;
    deletedIds.current.add(id);
    setItems((current) => current.filter((item) => item._id !== id));
    setTotalItems((current) => Math.max(0, current - 1));
  }

  return {
    items,
    totalItems,
    hasMore: nextCursor !== null,
    loadingMore,
    loadError,
    loadMore,
    removeItem,
  };
}
