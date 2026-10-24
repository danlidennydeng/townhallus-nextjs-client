"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SiteHeaderContent } from "@/components/site-chrome-content";
import { subscribeToAuthChanges } from "@/lib/auth-client";

export function StaticSiteHeader() {
  const pathname = usePathname();
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    let controller: AbortController | undefined;

    async function loadSession(activeController: AbortController) {
      try {
        const response = await fetch("/api/dashboard-session", {
          credentials: "include",
          cache: "no-store",
          signal: activeController.signal,
        });

        if (!response.ok) {
          return;
        }

        const session = (await response.json()) as { userId?: string | null };

        if (!activeController.signal.aborted) {
          setSessionUserId(session.userId || null);
        }
      } catch {
        // The page and locally stored sign-in controls remain available.
      }
    }

    function syncSession() {
      controller?.abort();
      controller = new AbortController();
      void loadSession(controller);
    }

    syncSession();
    const unsubscribe = subscribeToAuthChanges(syncSession);

    return () => {
      controller?.abort();
      unsubscribe();
    };
  }, [pathname]);

  return <SiteHeaderContent serverUserId={sessionUserId} />;
}
