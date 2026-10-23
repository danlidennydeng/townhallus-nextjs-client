import { ServerPixelAvatar } from "@/components/server-pixel-avatar";
import { SiteHeaderContent } from "@/components/site-chrome-content";
import { getAuthUserIdFromCookie } from "@/lib/auth-server";

export { SiteFooter, siteLinkClassName } from "@/components/site-chrome-content";

export async function SiteHeader() {
  const serverUserId = await getAuthUserIdFromCookie();
  const serverAvatar = serverUserId ? (
    <ServerPixelAvatar
      seed={serverUserId}
      alt=""
      size={44}
      className="size-full object-cover [image-rendering:pixelated]"
    />
  ) : null;

  return (
    <SiteHeaderContent
      serverUserId={serverUserId}
      serverAvatar={serverAvatar}
    />
  );
}
