"use client";

import { useSearchParams } from "next/navigation";
import { GlobeLockIcon, MailIcon, MapPinIcon, RefreshCwIcon, WifiIcon } from "lucide-react";

import { SiteFooter } from "@/components/site-chrome-content";
import { StaticSiteHeader } from "@/components/static-site-header";

const actionClassName = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9333EA]";

export default function AccessDeniedView() {
  const searchParams = useSearchParams();
  const unavailable = searchParams.get("reason") === "unavailable";

  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <StaticSiteHeader />
      <main className="flex-1">
        <section aria-labelledby="access-denied-heading" className="border-b border-[#c4c4c4] bg-[#f7f7f7]">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-[minmax(0,1fr)_280px] md:items-center lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-18">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase text-[#4d4d4d]">United States access</p>
              <h1 id="access-denied-heading" className="mt-3 break-words text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                {unavailable ? "We couldn’t verify your location." : "Access restricted."}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#1f1f1f] sm:text-xl sm:leading-9">
                {unavailable
                  ? "The location check is temporarily unavailable. Please try again."
                  : "This website is only available to users in the United States."}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- A full navigation reruns the location check instead of using a cached page. */}
                <a href="/" className={`${actionClassName} border-[#9333EA] bg-[#9333EA] text-[#ffffff] shadow-[0_1px_2px_rgba(0,0,0,0.14)] hover:border-[#7E22CE] hover:bg-[#7E22CE]`}>
                  <RefreshCwIcon className="size-4" aria-hidden="true" />
                  Check again
                </a>
                <a href="mailto:support@townhallus.com" className={`${actionClassName} border-[#9333EA] bg-transparent text-[#9333EA] hover:bg-[#eeeeee] hover:text-[#7E22CE]`}>
                  <MailIcon className="size-4" aria-hidden="true" />
                  Contact support
                </a>
              </div>
            </div>
            <aside aria-label="Website access requirement" className="min-w-0 border-l-0 border-[#999999] bg-[#eeeeee] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.16)] md:border-l md:bg-transparent md:shadow-none">
              <div className="flex items-center gap-4">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-[#999999] bg-[#ffffff]">
                  <GlobeLockIcon className="size-9 text-[#666666]" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm text-[#4d4d4d]">Availability</p>
                  <p className="font-semibold text-[#9333EA]">United States only</p>
                </div>
              </div>
              <dl className="mt-6 divide-y divide-[#c4c4c4] text-sm">
                <div className="grid gap-1 py-3 sm:grid-cols-[96px_1fr] sm:gap-3">
                  <dt className="font-medium text-[#4d4d4d]">Based on</dt>
                  <dd>Your internet connection</dd>
                </div>
                <div className="grid gap-1 py-3 sm:grid-cols-[96px_1fr] sm:gap-3">
                  <dt className="font-medium text-[#4d4d4d]">Status</dt>
                  <dd>{unavailable ? "Verification unavailable" : "Access restricted"}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        <section aria-labelledby="location-help-heading" className="bg-[#e6e6e6]">
          <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-[220px_1fr] lg:px-8 lg:py-14">
            <div>
              <p className="text-xs font-semibold uppercase text-[#4d4d4d]">Connection help</p>
              <h2 id="location-help-heading" className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">Already in the United States?</h2>
            </div>
            <div className="grid min-w-0 gap-4 lg:grid-cols-2">
              <article className="rounded-lg border border-[#c4c4c4] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
                <span className="flex size-12 items-center justify-center rounded-lg border border-[#9333EA] bg-[#eeeeee]">
                  <WifiIcon className="size-6 text-[#9333EA]" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-xl font-semibold">Check your connection</h3>
                <p className="mt-3 text-base leading-7 text-[#1f1f1f]">
                  Your network may be routing your connection through another country. Check your network settings, then select Check again.
                </p>
              </article>
              <article className="rounded-lg border border-[#c4c4c4] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
                <span className="flex size-12 items-center justify-center rounded-lg border border-[#9333EA] bg-[#eeeeee]">
                  <MapPinIcon className="size-6 text-[#9333EA]" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-xl font-semibold">Still seeing this message?</h3>
                <p className="mt-3 text-base leading-7 text-[#1f1f1f]">
                  Contact support if you are in the United States and still cannot access the website.
                </p>
                <a href="mailto:support@townhallus.com" className="mt-4 inline-block break-words font-semibold text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 hover:text-[#7E22CE] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9333EA]">
                  support@townhallus.com
                </a>
              </article>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
