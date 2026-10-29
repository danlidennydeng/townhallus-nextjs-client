"use client";

import Link from "next/link";
import { CookieIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CookieConsentActions } from "@/components/cookie-consent-actions";
import { useCookieConsent } from "@/lib/cookie-consent";

const linkClassName = "font-semibold text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 hover:text-[#7E22CE] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9333EA]";

export default function CookieWarning() {
  const { choice, ready } = useCookieConsent();
  const visible = ready && choice === null;
  const bannerRef = useRef<HTMLElement>(null);
  const [reservedHeight, setReservedHeight] = useState(0);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!visible || !banner) return;

    const observer = new ResizeObserver(() => {
      setReservedHeight(Math.ceil(banner.getBoundingClientRect().height) + 32);
    });
    observer.observe(banner);
    return () => observer.disconnect();
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Leave room to scroll the footer above the fixed notice. */}
      <div style={{ height: reservedHeight }} aria-hidden="true" />
      <section
        ref={bannerRef}
        role="region"
        aria-labelledby="cookie-warning-title"
        aria-describedby="cookie-warning-description"
        className="fixed inset-x-4 bottom-4 z-40 mx-auto max-h-[calc(100dvh-6rem)] max-w-7xl overflow-y-auto rounded-lg border border-[#999999] bg-[#f7f7f7] p-5 text-[#000000] shadow-[0_4px_16px_rgba(0,0,0,0.2)] sm:inset-x-6 lg:inset-x-8"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex min-w-0 items-start gap-4">
            <span className="hidden size-12 shrink-0 items-center justify-center rounded-lg border border-[#9333EA] bg-[#eeeeee] sm:flex">
              <CookieIcon className="size-6 text-[#9333EA]" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="cookie-warning-title" className="text-lg font-semibold">Your cookie choices</h2>
              <p id="cookie-warning-description" className="mt-2 text-sm leading-6 text-[#1f1f1f]">
                Essential cookies support sign-in and core features. Choose whether to allow optional analytics and advertising cookies.
              </p>
              <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link href="/privacy" className={linkClassName}>Privacy &amp; Cookie policy</Link>
                <Link href="/cookie-warning" prefetch={false} className={linkClassName}>Cookie settings</Link>
              </p>
            </div>
          </div>
          <CookieConsentActions />
        </div>
      </section>
    </>
  );
}
