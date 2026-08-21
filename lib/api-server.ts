import "server-only";

const fallbackApiBaseUrl =
  process.env.NODE_ENV === "production"
    ? "https://api.townhallus.com/api"
    : "http://127.0.0.1:3000/api";

const configuredApiBaseUrl =
  process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_URL || fallbackApiBaseUrl;

const apiServerBaseUrl = (
  configuredApiBaseUrl.startsWith("http")
    ? configuredApiBaseUrl
    : fallbackApiBaseUrl
).replace(/\/$/, "");

export function serverApiUrl(path: string) {
  return `${apiServerBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
