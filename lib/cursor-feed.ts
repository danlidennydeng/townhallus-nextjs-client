export type CursorFeedResponse<T> = {
  items: T[];
  totalItems?: number;
  pageSize: number;
  hasMore: boolean;
  nextCursor: string | null;
};

export function cursorFeedPath(path: string, cursor?: string | null) {
  return cursor ? `${path}?${new URLSearchParams({ cursor }).toString()}` : path;
}
