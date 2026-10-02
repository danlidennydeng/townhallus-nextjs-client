import type { Metadata } from "next";
import {
  CircleHelpIcon,
  ClockIcon,
  ClipboardListIcon,
  HeartHandshakeIcon,
  LifeBuoyIcon,
  MailIcon,
  ServerIcon,
} from "lucide-react";

import {
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Help | TownHallUS.com",
  description:
    "Get help with TownHallUS.com technical issues, server slowdowns, feedback, volunteering, and support.",
};

const supportEmail = "support@townhallus.com";

const metadataItems = [
  { label: "Updated", value: "March 12, 2025" },
  { label: "Version", value: "1.0.2" },
  { label: "Contact", value: supportEmail },
];

const helpTopics = [
  {
    icon: ClipboardListIcon,
    title: "Technical Problems",
    description:
      "If you encounter a technical problem, please provide a detailed description of the error message, the screen you were on before the issue occurred, and the step-by-step actions that led to the problem.",
  },
  {
    icon: ServerIcon,
    title: "Slow Server Responses",
    description:
      "If our servers respond very slowly to your requests, it may mean we need to add more servers. Please let us know the date and time you experienced the slowdown.",
  },
];

const contributionTopics = [
  {
    icon: HeartHandshakeIcon,
    title: "Support The Work",
    description:
      "If you have found this website useful, please consider helping us continue to support you. We are a non-profit organization, and you can own it just as much as we do.",
  },
  {
    icon: LifeBuoyIcon,
    title: "Volunteer",
    description:
      "You can volunteer your time to help maintain our community and keep the service steady for the people who use it.",
  },
  {
    icon: MailIcon,
    title: "Share Suggestions",
    description:
      "You can offer suggestions for improvement, report what feels confusing, or tell us what would make TownHallUS.com more useful.",
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

function TopicCard({
  description,
  icon: Icon,
  title,
}: Readonly<{
  description: string;
  icon: typeof CircleHelpIcon;
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

export default function HelpPage() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-[#c4c4c4] bg-[#f7f7f7]">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-[minmax(0,1fr)_280px] md:items-center lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-18">
            <div className="min-w-0 w-full max-w-[22rem] sm:max-w-none">
              <p className="text-sm font-semibold uppercase tracking-normal text-[#4d4d4d]">
                Help
              </p>
              <h1 className="mt-3 max-w-full break-words text-3xl font-semibold leading-tight tracking-normal text-[#000000] sm:max-w-4xl sm:text-5xl lg:text-6xl">
                Support for technical issues, feedback, and community help.
              </h1>
              <p className="mt-5 max-w-full break-words text-lg leading-8 text-[#1f1f1f] sm:max-w-3xl sm:text-xl sm:leading-9">
                We apologize for any inconveniences and appreciate your
                feedback. Please send details to{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  className={accentLinkClassName}
                >
                  {supportEmail}
                </a>
                .
              </p>
            </div>

            <aside
              aria-label="Help page details"
              className="min-w-0 w-full max-w-[22rem] border-l-0 border-[#999999] bg-[#eeeeee] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.16)] sm:max-w-none md:border-l md:bg-transparent md:shadow-none"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-16 items-center justify-center rounded-lg border border-[#999999] bg-[#ffffff]">
                  <CircleHelpIcon className="size-9 text-[#666666]" />
                </span>
                <div>
                  <p className="text-sm text-[#4d4d4d]">Page</p>
                  <p className="font-semibold text-[#000000]">HELP</p>
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
                      {item.label === "Contact" ? (
                        <a
                          href={`mailto:${item.value}`}
                          className={accentLinkClassName}
                        >
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </section>

        <Section eyebrow="Support" title="What We Can Help With">
          <div className="grid gap-4 md:grid-cols-2">
            {helpTopics.map((topic) => (
              <TopicCard key={topic.title} {...topic} />
            ))}
          </div>
          <p className="mt-6 max-w-4xl">
            For either type of request, email us at{" "}
            <a href={`mailto:${supportEmail}`} className={accentLinkClassName}>
              {supportEmail}
            </a>
            .
          </p>
        </Section>

        <Section eyebrow="Community" title="How You Can Help" surface="container">
          <p className="max-w-4xl">
            Whether you can donate to keep our servers running smoothly,
            volunteer your time to help maintain our community, or offer
            suggestions for improvement, we would love to hear from you.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {contributionTopics.map((topic) => (
              <TopicCard key={topic.title} {...topic} />
            ))}
          </div>
        </Section>

        <section className="border-t border-[#c4c4c4] bg-[#eeeeee]">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-[#999999] bg-[#f7f7f7]">
                <ClockIcon className="size-6 text-[#4d4d4d]" />
              </span>
              <p className="min-w-0 text-base leading-7 text-[#000000] sm:text-lg">
                Please include the date and time when reporting slow responses
                or other time-sensitive issues.
              </p>
            </div>
            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-[#9333EA] bg-[#9333EA] px-4 text-sm font-semibold text-[#ffffff] no-underline transition-colors hover:bg-[#7E22CE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000000]"
            >
              <MailIcon className="size-4" aria-hidden="true" />
              Email Support
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
