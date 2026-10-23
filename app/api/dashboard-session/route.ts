import { getAuthUserIdFromCookie } from "@/lib/auth-server";

export async function GET() {
  // Preserve the dashboard's display identity; data APIs still enforce authorization.
  const userId = await getAuthUserIdFromCookie();

  return Response.json(
    { userId },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
