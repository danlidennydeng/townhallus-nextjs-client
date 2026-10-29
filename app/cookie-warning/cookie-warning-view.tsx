"use client";

import Link from "next/link";
import { ArrowLeftIcon, CookieIcon, FileTextIcon, KeyRoundIcon, Settings2Icon } from "lucide-react";

import { CookieConsentActions } from "@/components/cookie-consent-actions";
import { SiteFooter } from "@/components/site-chrome-content";
import { StaticSiteHeader } from "@/components/static-site-header";
import { useCookieConsent } from "@/lib/cookie-consent";

const linkClassName = "font-semibold text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 hover:text-[#7E22CE] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9333EA]";

export default function CookieWarningView() {
  const { choice, ready, temporary } = useCookieConsent();
  const preferenceLabel = !ready ? "Loading..." : choice === null ? "No choice saved" : choice ? "Accepted" : "Rejected";

  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <StaticSiteHeader />
      <main className="flex-1">
        <section aria-labelledby="cookie-settings-heading" className="border-b border-[#c4c4c4] bg-[#f7f7f7]">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-[minmax(0,1fr)_280px] md:items-center lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-18">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase text-[#4d4d4d]">Privacy preferences</p>
              <h1 id="cookie-settings-heading" className="mt-3 break-words text-3xl font-semibold leading-tight text-[#000000] sm:text-5xl lg:text-6xl">
                Your cookie choices.
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#1f1f1f] sm:text-xl sm:leading-9">
                Choose whether to allow optional analytics and advertising cookies. Essential cookies support sign-in and core site features.
              </p>
              <Link href="/" prefetch={false} className={`${linkClassName} mt-6 inline-flex min-h-11 items-center gap-2`}>
                <ArrowLeftIcon className="size-4" aria-hidden="true" />
                Home
              </Link>
            </div>
            <aside aria-label="Your current cookie preference" className="min-w-0 border-l-0 border-[#999999] bg-[#eeeeee] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.16)] md:border-l md:bg-transparent md:shadow-none">
              <div className="flex items-center gap-4">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-[#999999] bg-[#ffffff]">
                  <CookieIcon className="size-9 text-[#666666]" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm text-[#4d4d4d]">Optional cookies</p>
                  <p className="font-semibold text-[#9333EA]">{preferenceLabel}</p>
                </div>
              </div>
              <dl className="mt-6 divide-y divide-[#c4c4c4] text-sm">
                <div className="grid gap-1 py-3 sm:grid-cols-[96px_1fr] sm:gap-3">
                  <dt className="font-medium text-[#4d4d4d]">Essential</dt>
                  <dd>Always available</dd>
                </div>
                <div className="grid gap-1 py-3 sm:grid-cols-[96px_1fr] sm:gap-3">
                  <dt className="font-medium text-[#4d4d4d]">Applies to</dt>
                  <dd>{temporary ? "This visit" : "This browser"}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        <section aria-labelledby="cookie-types-heading" className="bg-[#e6e6e6]">
          <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-[220px_1fr] lg:px-8 lg:py-14">
            <div>
              <p className="text-xs font-semibold uppercase text-[#4d4d4d]">Understand your choices</p>
              <h2 id="cookie-types-heading" className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">Essential and optional</h2>
            </div>
            <div className="grid min-w-0 gap-4 lg:grid-cols-2">
              <article className="rounded-lg border border-[#c4c4c4] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
                <span className="flex size-12 items-center justify-center rounded-lg border border-[#9333EA] bg-[#eeeeee]">
                  <KeyRoundIcon className="size-6 text-[#9333EA]" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-xl font-semibold">Essential cookies</h3>
                <p className="mt-3 text-base leading-7 text-[#1f1f1f]">
                  These support sign-in and the core features you use. Your optional-cookie choice does not sign you out or remove your login cookie.
                </p>
              </article>
              <article className="rounded-lg border border-[#c4c4c4] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
                <span className="flex size-12 items-center justify-center rounded-lg border border-[#9333EA] bg-[#eeeeee]">
                  <Settings2Icon className="size-6 text-[#9333EA]" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-xl font-semibold">Optional analytics and advertising</h3>
                <p className="mt-3 text-base leading-7 text-[#1f1f1f]">
                  You can accept or reject optional analytics and advertising cookies, and change that preference here at any time.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section aria-labelledby="save-cookie-preference-heading" className="border-t border-[#c4c4c4] bg-[#eeeeee]">
          <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-[220px_1fr] lg:px-8 lg:py-14">
            <div>
              <p className="text-xs font-semibold uppercase text-[#4d4d4d]">Manage preferences</p>
              <h2 id="save-cookie-preference-heading" className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">Make your choice</h2>
            </div>
            <div className="min-w-0 rounded-lg border border-[#c4c4c4] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
              <p className="mb-5 text-base leading-7 text-[#1f1f1f]">
                This preference is stored in this browser. Revisit Cookie settings from the menu or footer to change it. Clearing site storage removes your saved choice.
              </p>
              <CookieConsentActions showFeedback />
            </div>
          </div>
        </section>

        <section aria-label="Cookie policy" className="border-t border-[#c4c4c4] bg-[#e6e6e6]">
          <div className="mx-auto flex w-full max-w-7xl items-start gap-4 px-4 py-8 sm:items-center sm:px-6 lg:px-8">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-[#999999] bg-[#f7f7f7]">
              <FileTextIcon className="size-6 text-[#4d4d4d]" aria-hidden="true" />
            </span>
            <p className="min-w-0 text-base leading-7 sm:text-lg">
              Learn more in our <Link href="/privacy" className={linkClassName}>Privacy &amp; Cookie policy</Link>.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
