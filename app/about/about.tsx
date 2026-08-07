import Image from "next/image";

import {
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";

const metadataItems = [
  { label: "Updated", value: "September 12, 2025" },
  { label: "Version", value: "1.0.2" },
  { label: "Service", value: "Political and social discussion forum" },
];

const missions = [
  "We advocate for freedom of speech, honest and civil dialogue, democracy, and unity against political polarization.",
  "We provide an open, professional and neutral political platform.",
  "We encourage political discussions at the state, city, county, and national levels across the United States.",
  "We expose you to views from all sides, rather than misusing Artificial Intelligence to filter content and show only favored perspectives.",
  "We ensure your posts are visible to every user here, not just to your followers.",
  "We protect you from foreign influence and propaganda by allowing only young American citizens and registered U.S. voters to participate.",
  "We are committed to continually developing features designed specifically for political discussions.",
];

const upcomingFeatures = [
  "We are implementing the Web Content Accessibility Guidelines (WCAG) to ensure that users with disabilities can easily access our website.",
  "We are developing an email feedback system so that management can communicate effectively with our users.",
  "We are improving our Search Engine Optimization (SEO) so that potential users can easily find our website.",
  "More to come.",
];

const recruitingRoles = [
  {
    title: "Co-founders",
    description:
      "Remote volunteer position for native English speakers with strong spoken and written communication, experience with any level of U.S. government or U.S. election campaigns, willingness to learn on the job, and flexibility to make your own schedule.",
  },
  {
    title: "Frontend Developers",
    description:
      "Remote volunteer position for people with basic HTML, CSS, JavaScript, and React.js skills, willingness to learn on the job, and flexibility to make your own schedule.",
  },
  {
    title: "Marketing Associates",
    description:
      "Remote volunteer position with no experience required, willingness to learn on the job, and flexibility to make your own schedule.",
  },
];

const aboutAccentLinkClassName =
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

export default function About() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-[#c4c4c4] bg-[#f7f7f7]">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-[minmax(0,1fr)_280px] md:items-center lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-18">
            <div className="min-w-0 w-full max-w-[22rem] sm:max-w-none">
              <p className="text-sm font-semibold uppercase tracking-normal text-[#4d4d4d]">
                About Us
              </p>
              <h1 className="mt-3 max-w-full break-words text-3xl font-semibold leading-tight tracking-normal text-[#000000] sm:max-w-4xl sm:text-5xl lg:text-6xl">
                Open, professional, neutral discussion for American civic life.
              </h1>
              <p className="mt-5 max-w-full break-words text-lg leading-8 text-[#1f1f1f] sm:max-w-3xl sm:text-xl sm:leading-9">
                <span className="font-semibold text-[#9333EA]">
                  TownHallUS.com
                </span>{" "}
                is a political and social discussion forum service offered by
                <span className="font-semibold text-[#9333EA]">
                  Non-Partisan Alliance, Inc.
                </span>{" "}
                for American registered voters and American citizens between the
                ages of 13 and 17.
              </p>
            </div>

            <aside
              aria-label="About page details"
              className="min-w-0 w-full max-w-[22rem] border-l-0 border-[#999999] bg-[#eeeeee] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.16)] sm:max-w-none md:border-l md:bg-transparent md:shadow-none"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-16 items-center justify-center rounded-lg border border-[#999999] bg-[#ffffff]">
                  <Image src="/logo.svg" alt="" width={36} height={36} />
                </span>
                <div>
                  <p className="text-sm text-[#4d4d4d]">Organization</p>
                  <p className="font-semibold text-[#9333EA]">
                    Non-Partisan Alliance, Inc.
                  </p>
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

        <Section eyebrow="Purpose" title="What Are We?">
          <div className="max-w-4xl">
            <p>
              <strong className="text-[#9333EA]">TownHallUS.com</strong> is an
              open, professional and neutral political and social discussion
              forum service offered by{" "}
              <a
                href="https://www.non-partisan.online/"
                target="_blank"
                rel="noopener noreferrer"
                className={aboutAccentLinkClassName}
              >
                Non-Partisan Alliance, Inc.
              </a>{" "}
              exclusively for American registered voters and American citizens
              between the ages of 13 and 17.
            </p>
            <p className="mt-5">
              <span className="font-semibold text-[#9333EA]">
                Non-Partisan Alliance, Inc.
              </span>{" "}
              is a non-profit 501(c)(3) organization registered in the State of
              Delaware and operates only in the United States of America.
            </p>
          </div>
        </Section>

        <Section
          eyebrow="Mission"
          title="What We Stand For"
          surface="container"
        >
          <ol className="grid list-none gap-3 lg:grid-cols-2">
            {missions.map((mission, index) => (
              <li
                key={mission}
                className="grid grid-cols-[40px_1fr] gap-4 border border-[#c4c4c4] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-[#d1d1d1] text-sm font-semibold text-[#000000]">
                  {index + 1}
                </span>
                <p className="pt-1 text-base leading-7 text-[#000000]">
                  {mission}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        <Section eyebrow="Roadmap" title="More Features Are Coming">
          <ol className="max-w-4xl space-y-0 border-l border-[#999999] pl-5">
            {upcomingFeatures.map((feature, index) => (
              <li key={feature} className="relative pb-7 last:pb-0">
                <span className="absolute -left-[29px] top-1 flex size-4 items-center justify-center rounded-full border border-[#808080] bg-[#e6e6e6]">
                  <span className="size-2 rounded-full bg-[#4d4d4d]" />
                </span>
                <p className="text-sm font-semibold text-[#4d4d4d]">
                  Step {index + 1}
                </p>
                <p className="mt-1">{feature}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section eyebrow="Volunteer" title="Recruiting" surface="container">
          <div className="grid gap-4 md:grid-cols-3">
            {recruitingRoles.map((role) => (
              <article
                key={role.title}
                className="rounded-lg border border-[#c4c4c4] bg-[#f7f7f7] p-5 shadow-[0_2px_6px_rgba(0,0,0,0.16)] transition-shadow hover:shadow-[0_4px_10px_rgba(0,0,0,0.18)]"
              >
                <h3 className="text-xl font-semibold leading-snug tracking-normal text-[#000000]">
                  {role.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-[#1f1f1f]">
                  {role.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 border-t border-[#c4c4c4] pt-6">
            <p>
              Please email your resume to{" "}
              <a
                href="mailto:support@townhallus.com"
                className={aboutAccentLinkClassName}
              >
                support@townhallus.com
              </a>
              .
            </p>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
