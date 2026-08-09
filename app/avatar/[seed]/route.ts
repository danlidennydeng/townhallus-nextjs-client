import { createPixelAvatarSvg } from "@/lib/dicebear-pixel-avatar";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ seed: string }> }
) {
  const { seed } = await params;

  return new Response(createPixelAvatarSvg(seed), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/svg+xml; charset=utf-8",
    },
  });
}
