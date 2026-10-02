import type { Metadata } from "next";
import Link from "next/link";
import {
  CookieIcon,
  DatabaseIcon,
  FileTextIcon,
  GlobeLockIcon,
  KeyRoundIcon,
  LockIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UserShieldIcon,
} from "lucide-react";

import {
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Privacy & Cookie | TownHallUS.com",
  description:
    "Review TownHallUS.com privacy and cookie policies, including identity verification, public content, optional profile fields, and access cookies.",
};

const metadataItems = [
  { label: "Updated", value: "August 25th, 2025" },
  { label: "Version", value: "1.1.2" },
  { label: "Policy", value: "Privacy and cookies" },
];

const privacyCards = [
  {
    icon: UserShieldIcon,
    title: "Identity Verification",
    description:
      "We only collect the necessary information to verify your identity and registered voter status. This includes your legal first and last name, driver's license, ID card, or birth certificate numbers, and date of birth to determine your eligibility to become a registered user.",
  },
  {
    icon: LockIcon,
    title: "Essential Personal Information",
    description:
      "We also collect your email address for login and communication purposes. These items are considered your essential personal information and can be used to identify you.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Limited Sharing",
    description:
      "We do not share your essential personal information with anyone, except for the state, city (optional), and county (optional).",
  },
  {
    icon: DatabaseIcon,
    title: "Generated Username",
    description:
      'The system will generate your username, which includes your first name with an "x" replacing the second character and the first letter of your last name.',
  },
  // {
  //   icon: Trash2Icon,
  //   title: "Uploaded Documents",
  //   description:
  //     "We will permanently delete the image of your uploaded driver's license, ID card, or birth certificate from our server after your identity and registered voter status have been verified.",
  // },

    {
    icon: Trash2Icon,
    title: "Uploaded Documents",
    description:
      "We neither collect nor store your images, documents, videos, or other media files in our servers. You are responsible for those external links in the content of your post. We only collect and store your text post in our servers.",
  },
  {
    icon: GlobeLockIcon,
    title: "Access Location",
    description:
      "We have blocked all foreign IP addresses outside the United States. If you are an American registered voter living overseas, you can still access our website using a VPN service with a U.S. IP address.",
  },
];

const cookiePurposes = [
  "Keep you logged in.",
  "Enable core features and functionality across our services, including websites, apps, APIs, embeds, and emails.",
  "Remember and respect your preferences.",
  "Customize the content you see.",
  "Protect against spam, abuse, and security threats.",
  "Deliver more relevant ads.",
  "Understand your interactions to improve our services.",
  "Measure ad and marketing performance.",
  "Monitor service quality and identify bugs.",
  "Collect data to operate our business and enforce our User Rules.",
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

function PolicyCard({
  description,
  icon: Icon,
  title,
}: Readonly<{
  description: string;
  icon: typeof ShieldCheckIcon;
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

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-[#c4c4c4] bg-[#f7f7f7]">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-[minmax(0,1fr)_280px] md:items-center lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-18">
            <div className="min-w-0 w-full max-w-[22rem] sm:max-w-none">
              <p className="text-sm font-semibold uppercase tracking-normal text-[#4d4d4d]">
                Privacy & Cookie
              </p>
              <h1 className="mt-3 max-w-full break-words text-3xl font-semibold leading-tight tracking-normal text-[#000000] sm:max-w-4xl sm:text-5xl lg:text-6xl">
                How TownHallUS.com handles personal information and cookies.
              </h1>
              <p className="mt-5 max-w-full break-words text-lg leading-8 text-[#1f1f1f] sm:max-w-3xl sm:text-xl sm:leading-9">
                We collect only the information needed for identity, eligibility,
                login, communication, security, service quality, and core product
                functionality.
              </p>
            </div>

            <aside
              aria-label="Privacy and cookie page details"
              className="min-w-0 w-full max-w-[22rem] border-l-0 border-[#999999] bg-[#eeeeee] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.16)] sm:max-w-none md:border-l md:bg-transparent md:shadow-none"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-16 items-center justify-center rounded-lg border border-[#999999] bg-[#ffffff]">
                  <ShieldCheckIcon className="size-9 text-[#666666]" />
                </span>
                <div>
                  <p className="text-sm text-[#4d4d4d]">Page</p>
                  <p className="font-semibold text-[#000000]">
                    PRIVACY AND COOKIE POLICIES
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

        <Section eyebrow="Privacy" title="Personal Information">
          <div className="grid gap-4 md:grid-cols-2">
            {privacyCards.map((card) => (
              <PolicyCard key={card.title} {...card} />
            ))}
          </div>

          <div className="mt-6 max-w-4xl space-y-5">
            <p>
              Your Driver License number, Birthday, last 4 digits of Social Security Number, and self-introduction are optional. We will never share them except your self-introduction.
            </p>
            <p>
              Your posts and comments are publicly visible and can be read by
              all our users.
            </p>
            <p>
              You are responsible for deleting all posts, comments, and other
              content created by you before deleting your account.
            </p>
          </div>
        </Section>

        <Section eyebrow="Cookies" title="How Cookies Are Used" surface="container">
          <div className="max-w-4xl">
            <p>
              We use cookies, pixels, local storage, and similar technologies to
              provide a faster, safer, and more personalized experience. These
              tools help us:
            </p>

            <ol className="mt-6 grid list-none gap-3 lg:grid-cols-2">
              {cookiePurposes.map((purpose, index) => (
                <li
                  key={purpose}
                  className="grid grid-cols-[40px_1fr] gap-4 border border-[#c4c4c4] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#d1d1d1] text-sm font-semibold text-[#000000]">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-base leading-7 text-[#000000]">
                    {index === cookiePurposes.length - 1 ? (
                      <>
                        Collect data to operate our business and enforce our{" "}
                        <Link href="/userrules" className={accentLinkClassName}>
                          User Rules
                        </Link>
                        .
                      </>
                    ) : (
                      purpose
                    )}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Section>

        <Section eyebrow="Access" title="Login Cookie">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <article className="rounded-lg border border-[#c4c4c4] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
              <span className="flex size-12 items-center justify-center rounded-lg border border-[#9333EA] bg-[#eeeeee]">
                <CookieIcon className="size-6 text-[#9333EA]" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-xl font-semibold leading-snug text-[#000000]">
                access_cookie
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#1f1f1f]">
                We use an encrypted cookie called access_cookie that contains
                non-essential information which cannot be used to identify you.
              </p>
            </article>

            <article className="rounded-lg border border-[#c4c4c4] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
              <span className="flex size-12 items-center justify-center rounded-lg border border-[#9333EA] bg-[#eeeeee]">
                <KeyRoundIcon
                  className="size-6 text-[#9333EA]"
                  aria-hidden="true"
                />
              </span>
              <h3 className="mt-4 text-xl font-semibold leading-snug text-[#000000]">
                Up To 3 Months
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#1f1f1f]">
                The access_cookie allows you to stay logged in to our web app
                for up to 3 months without needing to re-enter your password. If
                you would prefer a more secure option, you can log out after
                using our website. The access_cookie will then be deleted.
              </p>
            </article>
          </div>
        </Section>

        <section className="border-t border-[#c4c4c4] bg-[#eeeeee]">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-[#999999] bg-[#f7f7f7]">
                <FileTextIcon className="size-6 text-[#4d4d4d]" />
              </span>
              <p className="min-w-0 text-base leading-7 text-[#000000] sm:text-lg">
                This page may be updated at any time without prior notice.
                Please check back regularly to stay informed.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
