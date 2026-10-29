"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  CircleHelpIcon,
  HouseIcon,
  InfoIcon,
  MailIcon,
  SearchIcon,
} from "lucide-react";

import { SiteFooter } from "@/components/site-chrome-content";
import { StaticSiteHeader } from "@/components/static-site-header";

const recoveryLinks = [
  {
    href: "/faqpage",
    title: "Read the FAQ",
    description: "Find answers about accounts, posting, comments, and the community.",
    icon: CircleHelpIcon,
  },
  {
    href: "/about",
    title: "About TownHallUS.com",
    description: "Learn about our mission and our approach to political discussion.",
    icon: InfoIcon,
  },
];

const actionClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9333EA]";
const contactLinkClassName =
  "text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 transition-colors hover:text-[#7E22CE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#000000]";

export default function NotFoundView() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <StaticSiteHeader />

      <main className="flex-1">
        <section aria-labelledby="not-found-heading" className="border-b border-[#c4c4c4] bg-[#f7f7f7]">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-[minmax(0,1fr)_280px] md:items-center lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-18">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-normal text-[#4d4d4d]">
                Error 404
              </p>
              <h1 id="not-found-heading" className="mt-3 max-w-full break-words text-3xl font-semibold leading-tight tracking-normal text-[#000000] sm:text-5xl lg:text-6xl">
                Page not found
              </h1>
              <p className="mt-5 max-w-3xl break-words text-lg leading-8 text-[#1f1f1f] sm:text-xl sm:leading-9">
                The page you are looking for does not exist or may have moved.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/"
                  prefetch={false}
                  className={`${actionClassName} border-[#9333EA] bg-[#9333EA] text-[#ffffff] shadow-[0_1px_2px_rgba(0,0,0,0.14)] hover:border-[#7E22CE] hover:bg-[#7E22CE]`}
                >
                  <HouseIcon className="size-5" aria-hidden="true" />
                  Go home
                </Link>
                <Link
                  href="/search"
                  prefetch={false}
                  className={`${actionClassName} border-[#9333EA] bg-transparent text-[#9333EA] hover:bg-[#eeeeee] hover:text-[#7E22CE]`}
                >
                  <SearchIcon className="size-5" aria-hidden="true" />
                  Search posts
                </Link>
              </div>
            </div>

            <aside aria-label="Finding your way back" className="min-w-0 border-l-0 border-[#999999] bg-[#eeeeee] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.16)] md:border-l md:bg-transparent md:shadow-none">
              <div className="flex items-center gap-4">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-[#999999] bg-[#ffffff]">
                  <CircleHelpIcon className="size-9 text-[#666666]" aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold text-[#4d4d4d]">Page unavailable</p>
              </div>
              <p className="mt-5 text-7xl font-semibold leading-none tracking-tight text-[#9333EA]" aria-hidden="true">
                404
              </p>
              <p className="mt-4 text-base leading-7 text-[#1f1f1f]">
                Check the web address for a typo, or use the links here to continue exploring.
              </p>
            </aside>
          </div>
        </section>

        <section aria-labelledby="recovery-heading" className="bg-[#e6e6e6]">
          <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-[220px_1fr] lg:px-8 lg:py-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-[#4d4d4d]">Helpful links</p>
              <h2 id="recovery-heading" className="mt-2 text-2xl font-semibold leading-tight text-[#000000] sm:text-3xl">
                Continue exploring
              </h2>
            </div>
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              {recoveryLinks.map(({ href, title, description, icon: Icon }) => (
                <Link key={href} href={href} className="group flex min-w-0 flex-col rounded-lg border border-[#c4c4c4] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[0_3px_8px_rgba(0,0,0,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9333EA]">
                  <span className="flex size-12 items-center justify-center rounded-lg border border-[#999999] bg-[#eeeeee]">
                    <Icon className="size-6 text-[#4d4d4d]" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 flex items-start justify-between gap-3 break-words text-lg font-semibold leading-7 text-[#9333EA] group-hover:text-[#7E22CE]">
                    {title}
                    <ArrowRightIcon className="mt-1 size-5 shrink-0" aria-hidden="true" />
                  </h3>
                  <p className="mt-2 text-base leading-7 text-[#1f1f1f]">{description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section aria-label="Contact support" className="border-t border-[#c4c4c4] bg-[#eeeeee]">
          <div className="mx-auto flex w-full max-w-7xl items-start gap-4 px-4 py-8 sm:items-center sm:px-6 lg:px-8">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-[#999999] bg-[#f7f7f7]">
              <MailIcon className="size-6 text-[#4d4d4d]" aria-hidden="true" />
            </span>
            <p className="min-w-0 text-base leading-7 text-[#000000] sm:text-lg">
              Need help finding something? Email{" "}
              <a href="mailto:support@townhallus.com" className={`${contactLinkClassName} break-words`}>support@townhallus.com</a>.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
