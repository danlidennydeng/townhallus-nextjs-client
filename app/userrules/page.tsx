import type { Metadata } from "next";
import Link from "next/link";
import {
  BanIcon,
  CircleAlertIcon,
  ClipboardListIcon,
  MessageSquareWarningIcon,
  ScaleIcon,
  ShieldAlertIcon,
  UserXIcon,
} from "lucide-react";

import {
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "User Rules | TownHallUS.com",
  description:
    "Review TownHallUS.com user rules, prohibited behavior, representation limits, and penalties for violations.",
};

const metadataItems = [
  { label: "Updated", value: "August 25th, 2026" },
  { label: "Version", value: "1.1.2" },
  { label: "Scope", value: "User conduct" },
];

const violationRules = [
  "Inciting or advocating violence.",
  "Using the site or platform for illegal activities, products, or services.",
  "Spamming the same content or comments multiple times.",
  "Crawling or scraping to gather, view, or access information.",
  "Posting offensive, hateful, discriminatory, obscene, abusive, or threatening content.",
  "Harassing or bullying other users.",
  "Artificially posting content, comments, likes, or other forms of manipulation.",
  "Violating the intellectual property rights of others, including copyrights and trademarks.",
  "Exposing another user account credentials or personal information.",
  "Posting fake information.",
];

const penalties = [
  {
    icon: MessageSquareWarningIcon,
    title: "Content May Not Be Published",
    description:
      "A user post or comment may not be published after a rule violation.",
  },
  {
    icon: BanIcon,
    title: "Publishing Privileges May Be Limited",
    description:
      "A user may not be able to publish posts or comments after violating the rules.",
  },
  {
    icon: UserXIcon,
    title: "Login May Be Restricted",
    description:
      "A user may not be able to log in for a certain period of time.",
  },
];

const accentLinkClassName =
  "text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 transition-colors hover:text-[#7E22CE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#000000]";

function Section({
  eyebrow,
  title,
  children,
  surface = "plain",
}: Readonly<{
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  surface?: "plain" | "container";
}>) {
  return (
    <section
      className={`border-t border-[#c4c4c4] ${
        surface === "container" ? "bg-[#eeeeee]" : "bg-[#e6e6e6]"
      }`}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-[220px_1fr] lg:px-8 lg:py-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-[#4d4d4d]">
            {eyebrow}
          </p>
          <h2 className="mt-2 max-w-sm text-2xl font-semibold leading-tight tracking-normal text-[#000000] sm:text-3xl">
            {title}
          </h2>
        </div>

        <div className="min-w-0 text-base leading-7 text-[#000000] sm:text-lg sm:leading-8">
          {children}
        </div>
      </div>
    </section>
  );
}

function RuleList({ rules }: Readonly<{ rules: string[] }>) {
  return (
    <ol className="grid list-none gap-3 lg:grid-cols-2">
      {rules.map((rule, index) => (
        <li
          key={rule}
          className="grid grid-cols-[40px_1fr] gap-4 border border-[#c4c4c4] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-[#d1d1d1] text-sm font-semibold text-[#000000]">
            {index + 1}
          </span>
          <p className="pt-1 text-base leading-7 text-[#000000]">{rule}</p>
        </li>
      ))}
    </ol>
  );
}

function PenaltyCard({
  description,
  icon: Icon,
  title,
}: Readonly<{
  description: string;
  icon: typeof MessageSquareWarningIcon;
  title: string;
}>) {
  return (
    <article className="rounded-lg border border-[#c4c4c4] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[0_3px_8px_rgba(0,0,0,0.16)]">
      <span className="flex size-12 items-center justify-center rounded-lg border border-[#9333EA] bg-[#eeeeee]">
        <Icon className="size-6 text-[#9333EA]" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-xl font-semibold leading-snug text-[#000000]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[#1f1f1f]">{description}</p>
    </article>
  );
}

export default function UserRulesPage() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-[#c4c4c4] bg-[#f7f7f7]">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-[minmax(0,1fr)_280px] md:items-center lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-18">
            <div className="min-w-0 w-full max-w-[22rem] sm:max-w-none">
              <p className="text-sm font-semibold uppercase tracking-normal text-[#4d4d4d]">
                User Rules
              </p>
              <h1 className="mt-3 max-w-full break-words text-3xl font-semibold leading-tight tracking-normal text-[#000000] sm:max-w-4xl sm:text-5xl lg:text-6xl">
                Rules for keeping TownHallUS.com safe, lawful, and fair.
              </h1>
              <p className="mt-5 max-w-full break-words text-lg leading-8 text-[#1f1f1f] sm:max-w-3xl sm:text-xl sm:leading-9">
                These rules explain prohibited behavior, limits on
                representation, and possible penalties when users violate the
                standards of the platform.
              </p>
            </div>

            <aside
              aria-label="User rules page details"
              className="min-w-0 w-full max-w-[22rem] border-l-0 border-[#999999] bg-[#eeeeee] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.16)] sm:max-w-none md:border-l md:bg-transparent md:shadow-none"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-16 items-center justify-center rounded-lg border border-[#999999] bg-[#ffffff]">
                  <ShieldAlertIcon className="size-9 text-[#666666]" />
                </span>
                <div>
                  <p className="text-sm text-[#4d4d4d]">Page</p>
                  <p className="font-semibold text-[#000000]">USER RULES</p>
                </div>
              </div>

              <dl className="mt-6 divide-y divide-[#c4c4c4]">
                {metadataItems.map((item) => (
                  <div
                    key={item.label}
                    className="grid gap-1 py-3 text-sm sm:grid-cols-[96px_1fr] sm:gap-3"
                  >
                    <dt className="font-medium text-[#4d4d4d]">{item.label}</dt>
                    <dd className="min-w-0 break-words text-[#000000]">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </section>

        <Section eyebrow="Violations" title="Prohibited Behavior">
          <p className="mb-6 max-w-4xl">
            We strictly prohibit the following behaviors:
          </p>
          <RuleList rules={violationRules} />
        </Section>

        <Section
          eyebrow="Representation"
          title="Speak Only For Yourself"
          surface="container"
        >
          <div className="rounded-lg border border-[#999999] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
            <div className="flex gap-4">
              <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-lg border border-[#9333EA] bg-[#eeeeee]">
                <ScaleIcon className="size-6 text-[#9333EA]" aria-hidden="true" />
              </span>
              <div className="min-w-0 space-y-4">
                <p>
                  A user is NOT allowed to represent any foreign individuals,
                  foreign groups, foreign organizations, foreign entities, or
                  foreign governments.
                </p>
                <p>
                  A user may only represent herself or himself and express her
                  or his own opinions as an individual U.S. citizen or as an individual registered voter of the
                  United States of America.
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section eyebrow="Penalties" title="Consequences For Violations">
          <p className="mb-6 max-w-4xl">
            A user may receive the following penalties for the violations above.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {penalties.map((penalty) => (
              <PenaltyCard key={penalty.title} {...penalty} />
            ))}
          </div>
        </Section>

        <section className="border-t border-[#c4c4c4] bg-[#eeeeee]">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-[#999999] bg-[#f7f7f7]">
                <ClipboardListIcon className="size-6 text-[#4d4d4d]" />
              </span>
              <p className="min-w-0 text-base leading-7 text-[#000000] sm:text-lg">
                This page may be updated at any time without prior notice.
                Please check back regularly to stay informed. These rules work
                together with our{" "}
                <Link href="/terms" className={accentLinkClassName}>
                  Terms
                </Link>
                .
              </p>
            </div>
            <Link
              href="/helppage"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-[#9333EA] bg-[#9333EA] px-4 text-sm font-semibold text-[#ffffff] no-underline transition-colors hover:bg-[#7E22CE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000000]"
            >
              <CircleAlertIcon className="size-4" aria-hidden="true" />
              Report A Violation
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
