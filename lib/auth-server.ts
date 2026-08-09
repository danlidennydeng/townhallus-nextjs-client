import "server-only";

import { cookies } from "next/headers";

type AccessTokenPayload = {
  id?: unknown;
};

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

  return Buffer.from(padded, "base64").toString("utf8");
}

function readAccessTokenPayload(token: string) {
  const payload = token.split(".")[1];

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export async function getAuthUserIdFromCookie() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return null;
  }

  const payload = readAccessTokenPayload(accessToken);
  const userId = payload?.id;

  // This id only seeds display chrome; Express still verifies auth for data APIs.
  return typeof userId === "string" && userId.trim() ? userId : null;
}
