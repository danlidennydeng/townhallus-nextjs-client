import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  CircleAlertIcon,
  FileTextIcon,
  GlobeIcon,
  KeyRoundIcon,
  MailIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
} from "lucide-react";

import {
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Terms | TownHallUS.com",
  description:
    "Review the TownHallUS.com Terms of Service, including eligibility, content rules, account responsibilities, disclaimers, arbitration, and intellectual property rights.",
};

const supportEmail = "support@townhallus.com";

const metadataItems = [
  { label: "Updated", value: "August 25th, 2026" },
  { label: "Version", value: "1.1.2" },
  { label: "Agreement", value: "Terms of Service" },
];

const overviewCards = [
  {
    icon: GlobeIcon,
    title: "Services",
    description:
      "The Services include our websites, text messages, APIs, email notifications, apps, buttons, widgets, ads, online store features, and anything else that mentions these Terms.",
  },
  {
    icon: FileTextIcon,
    title: "Content",
    description:
      "Content includes text, links, images, videos, audio, and other materials you see or share through the Services.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Agreement",
    description:
      "By using the Services, you agree to follow these Terms and any rules or policies that are part of them.",
  },
];

const eligibilityRules = [
  "You can use our Services only if you are legally allowed to make an agreement with us and the laws in your area do not forbid it.",
  "You must be a U.S. citizen, or a registered voter in the United States of America to use our web App and website.",
  "If you accept these Terms for someone else, such as a minor, company, or organization, you confirm that you are allowed to make this agreement on their behalf.",
  "Non-Partisan Alliance, Inc. has the right to make sure everyone follows these rules.",
];

const contentRules = [
  "You are fully responsible for how you use the Services and for anything you share.",
  "You should only post content that you are comfortable making public.",
  "If you choose to trust or act on anything shared on our platform, you do so at your own risk.",
  "We may check content from time to time, but we are not required to do so.",
  "We have the right to remove content that breaks our rules, including copyright violations, impersonation, illegal activity, harassment, or other misuse.",
  "You still own anything you post, upload, or share on our platform, including your photos, videos, and audio.",
  "By posting content, you confirm that you have the rights and permission needed for us to share it.",
];

const serviceActionReasons = [
  "Follow laws or respond to government requests.",
  "Enforce our Terms and investigate rule-breaking.",
  "Prevent fraud, fix security problems, or resolve technical problems.",
  "Help with customer support.",
  "Protect our company, users, or the public.",
];

const misuseRules = [
  "Try to break into areas of the platform that are not public.",
  "Mess with our systems or those of our partners.",
  "Try to hack, test, or get around our security.",
  "Use tools or tricks to search or gather data unless we have said it is allowed.",
  "Use bots or automation to crawl or scrape the platform without written permission.",
  "Fake your identity or where your messages come from.",
  "Send false or misleading information.",
  "Break our rules about spam, manipulation, or abuse.",
  "Disrupt the platform by sending malware or overwhelming it with too much activity.",
];

const terminationReasons = [
  "You break these Terms or our Rules and Policies.",
  "Your actions create legal problems for us.",
  "Your account is linked to illegal activity.",
  "Your account has been inactive for a long time.",
  "Continuing to provide the Services is no longer possible or practical for us.",
];

const liabilityItems = [
  "Your computer gets damaged.",
  "You lose data.",
  "Something goes wrong when you use the Services or view content.",
  "Messages or content do not get saved, deleted, or delivered properly.",
  "The Services do not meet your needs.",
  "The Services are interrupted, insecure, or have errors.",
];

const thirdPartyRiskItems = [
  "Your use of the Services or inability to use them.",
  "What other users or third parties do or post, even if it is illegal, offensive, or harmful.",
  "Any content you get through the Services.",
  "Anyone accessing your account or changing your content without permission.",
];

const arbitrationItems = [
  {
    title: "Agreement to Arbitrate",
    description:
      "All disputes, claims, or controversies arising out of or relating to this Agreement or the use of our Services shall be resolved exclusively through binding arbitration administered by the American Arbitration Association.",
  },
  {
    title: "Rules",
    description:
      "For business-related disputes, the AAA Commercial Arbitration Rules shall apply. For disputes involving individual consumers, the AAA Consumer Arbitration Rules shall apply.",
  },
  {
    title: "Location and Method",
    description:
      "Arbitration proceedings shall be conducted online to the fullest extent possible. If in-person proceedings are required, the preferred locations are Sacramento, California first, and San Francisco, California second.",
  },
  {
    title: "Fees and Costs",
    description:
      "The party initiating arbitration shall pay the applicable filing fee when submitting the claim. The Respondent shall pay any required fees based on the final determination of the arbitrator.",
  },
  {
    title: "Governing Law",
    description:
      "This Agreement shall be governed by, construed, and enforced in accordance with the laws of the State of Delaware, without regard to conflict of laws principles.",
  },
  {
    title: "Response and Class Waiver",
    description:
      "The Respondent has 30 calendar days to file a formal response. All parties waive the right to bring, join, or participate in any class action or class-wide arbitration.",
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
  children: ReactNode;
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

function NumberedList({ items }: Readonly<{ items: ReactNode[] }>) {
  return (
    <ol className="grid list-none gap-3 lg:grid-cols-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="grid grid-cols-[40px_1fr] gap-4 border border-[#c4c4c4] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-[#d1d1d1] text-sm font-semibold text-[#000000]">
            {index + 1}
          </span>
          <p className="pt-1 text-base leading-7 text-[#000000]">{item}</p>
        </li>
      ))}
    </ol>
  );
}

function Callout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="rounded-lg border border-[#999999] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
      <div className="flex gap-3">
        <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-[#9333EA] bg-[#eeeeee]">
          <CircleAlertIcon className="size-5 text-[#9333EA]" aria-hidden="true" />
        </span>
        <div className="min-w-0 text-base leading-7 text-[#000000]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-[#c4c4c4] bg-[#f7f7f7]">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-[minmax(0,1fr)_280px] md:items-center lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-18">
            <div className="min-w-0 w-full max-w-[22rem] sm:max-w-none">
              <p className="text-sm font-semibold uppercase tracking-normal text-[#4d4d4d]">
                Terms
              </p>
              <h1 className="mt-3 max-w-full break-words text-3xl font-semibold leading-tight tracking-normal text-[#000000] sm:max-w-4xl sm:text-5xl lg:text-6xl">
                Terms of Service for using TownHallUS.com.
              </h1>
              <p className="mt-5 max-w-full break-words text-lg leading-8 text-[#1f1f1f] sm:max-w-3xl sm:text-xl sm:leading-9">
                These Terms explain the rules for using our Services, posting
                Content, maintaining an account, resolving disputes, and
                respecting the rights of Non-Partisan Alliance, Inc. and other
                users.
              </p>
            </div>

            <aside
              aria-label="Terms page details"
              className="min-w-0 w-full max-w-[22rem] border-l-0 border-[#999999] bg-[#eeeeee] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.16)] sm:max-w-none md:border-l md:bg-transparent md:shadow-none"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-16 items-center justify-center rounded-lg border border-[#999999] bg-[#ffffff]">
                  <ScrollTextIcon className="size-9 text-[#666666]" />
                </span>
                <div>
                  <p className="text-sm text-[#4d4d4d]">Page</p>
                  <p className="font-semibold text-[#000000]">
                    TERMS OF SERVICES (ToS)
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

        <Section eyebrow="Overview" title="What This Agreement Covers">
          <div className="max-w-4xl space-y-5">
            <p>
              These Terms of Service explain the rules for using our Services.
              They are a legal agreement between you and Non-Partisan Alliance,
              Inc., the organization that provides the Services.
            </p>
            <p>
              When we say &quot;we,&quot; &quot;us,&quot; or
              &quot;our,&quot; we mean Non-Partisan Alliance, Inc. at 8 The
              Green STE A, Dover, DE 19901. When we say &quot;you&quot; or
              &quot;your,&quot; we mean the person accepting this agreement,
              or the minor or group that person represents.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {overviewCards.map((card) => (
              <TopicCard key={card.title} {...card} />
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Section 1"
          title="Eligibility to Use the Services"
          surface="container"
        >
          <NumberedList items={eligibilityRules} />
        </Section>

        <Section eyebrow="Section 2" title="Privacy Policy & Cookie">
          <div className="max-w-4xl">
            <p>
              Our Privacy Policy explains what information we collect, how we use
              it, and how we take care of it when you use our Services. By using
              our Services, you agree to the way we collect and use your
              information as described in the{" "}
              <Link href="/privacy" className={accentLinkClassName}>
                Privacy Policy & Cookie
              </Link>
              .
            </p>
          </div>
        </Section>

        <Section eyebrow="Section 3" title="Content on the Services" surface="container">
          <NumberedList items={contentRules} />

          <div className="mt-6 max-w-4xl space-y-5">
            <p>
              We do not check or guarantee that everything on the platform is
              true or accurate, and we do not always agree with the opinions
              people post. Some content may be offensive, harmful, incorrect, or
              misleading. Whatever is shared is the responsibility of the person
              who posted it.
            </p>
            <p>
              If you find someone violating our rules, please report it
              immediately at{" "}
              <a href={`mailto:${supportEmail}`} className={accentLinkClassName}>
                {supportEmail}
              </a>
              .
            </p>
            <p>
              We may review and analyze what you share and do on our platform to
              help us improve our Services, including training better AI and
              machine learning systems. We may also share your content with other
              companies or platforms to help promote, distribute, or publish it
              elsewhere.
            </p>
            <p>
              By using our Services, you give us permission to do this without
              expecting payment. Your content might be changed or adapted when it
              is shared, published, or broadcasted, for example to fit different
              formats or platforms.
            </p>
          </div>
        </Section>

        <Section eyebrow="Section 4" title="Using the Services">
          <div className="max-w-4xl space-y-5">
            <p>
              Please read our{" "}
              <Link href="/userrules" className={accentLinkClassName}>
                User Rules
              </Link>
              . They are part of these Terms of Service and explain what is not
              allowed on our platform. You must follow those rules, along with
              all laws and regulations, when using our Services.
            </p>
            <p>
              If someone breaks these rules, Non-Partisan Alliance, Inc. may
              take action. This could include removing content, limiting access,
              or suspending an account.
            </p>
            <p>
              We are always working to improve the Services. Sometimes that means
              changing features, adding new ones, or removing things temporarily
              or permanently. We may also set limits on storage or usage, remove
              content, limit visibility, suspend accounts, or take back usernames
              if needed.
            </p>
            <p>
              By using our Services, you agree that we and our trusted partners
              can show ads, including next to your content or others&apos;
              content.
            </p>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-lg font-semibold text-[#000000]">
              When We May Access, Review, Save, or Share Information
            </h3>
            <NumberedList items={serviceActionReasons} />
          </div>

          <div className="mt-6 max-w-4xl space-y-5">
            <p>
              We do not share personal information that identifies you unless it
              is explained in our{" "}
              <Link href="/privacy" className={accentLinkClassName}>
                Privacy Policy & Cookie
              </Link>
              .
            </p>
            <p>
              To use our Services, you might need to create an account. You are
              responsible for keeping it safe by choosing a strong password and
              only using it for this account. We are not responsible for problems
              that happen if you do not protect your account.
            </p>
            <p>
              Our Services are protected by copyright, trademark, and other laws.
              These Terms do not give you the right to use the name
              &quot;Non-Partisan Alliance, Inc.,&quot; our domain names
              (non-partisan.online, townhallus.com), logos, trademarks, or
              brand features. Everything about the Services, except content
              users share, belongs to us or our partners.
            </p>
            <p>
              If you give us feedback or ideas about how we can improve, that is
              voluntary. We may use your suggestions in any way we choose, and we
              do not have to pay you for them.
            </p>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-lg font-semibold text-[#000000]">
              Misuse Is Not Allowed
            </h3>
            <NumberedList items={misuseRules} />
          </div>

          <div className="mt-6 max-w-4xl space-y-5">
            <p>
              Use the Services the way they are meant to be used. That keeps the
              platform safe and fair for everyone. You are not allowed to help
              others break these Terms, including sharing tools or services that
              encourage violations.
            </p>
            <p>
              You can end your agreement with us anytime by deactivating your
              account and stopping use of the Services. For details on how to
              deactivate your account and how we handle your data, check our{" "}
              <Link href="/privacy" className={accentLinkClassName}>
                Privacy Policy & Cookie
              </Link>
              .
            </p>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-lg font-semibold text-[#000000]">
              Account Suspension or Closure
            </h3>
            <NumberedList items={terminationReasons} />
          </div>

          <div className="mt-6 max-w-4xl space-y-5">
            <p>
              We will make reasonable efforts to notify you through the email
              linked to your account or the next time you attempt to log in. In
              some cases, and to the extent allowed by law, we may terminate your
              account or access to the Services for any reason or without
              specific justification.
            </p>
            <p>
              If your account is terminated, your license to use the Services
              also ends. For clarity, these Terms continue to apply even after
              your account is deactivated or terminated.
            </p>
          </div>
        </Section>

        <Section
          eyebrow="Section 5"
          title="Disclaimers and Limitation of Liability"
          surface="container"
        >
          <div className="max-w-4xl space-y-5">
            <p>
              You use the Services and any related content at your own risk.
              Everything is provided &quot;as is&quot; and &quot;as
              available,&quot; with no guarantees.
            </p>
            <p>
              When we say &quot;Non-Partisan Alliance Inc.,&quot; we mean
              its service, product, domain names (non-partisan.online,
              townhallus.com), affiliates, employees, officers, partners, and
              others connected to it. To the fullest extent allowed by law, we
              do not make promises or guarantees about the Services, including
              implied promises about fitness for a particular purpose,
              reliability, or non-infringement.
            </p>
            <p>
              We do not guarantee that the Services or any content will always be
              accurate, complete, up to date, secure, reliable, or available.
            </p>
          </div>

          <div className="mt-6">
            <NumberedList items={liabilityItems} />
          </div>

          <div className="mt-6 max-w-4xl space-y-5">
            <p>
              Advice or information from us, whether written or verbal, does not
              create a promise or guarantee unless we clearly say so in writing.
              As much as the law allows, Non-Partisan Alliance Inc. and its
              partners are not responsible for indirect, accidental, special, or
              serious damages, including lost profits, lost data, lost business,
              or harm to your reputation.
            </p>
          </div>

          <div className="mt-6">
            <NumberedList items={thirdPartyRiskItems} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Callout>
              <p>
                If something goes wrong, the most we will ever owe you is the
                total amount you donated within 30 days. This limit applies no
                matter what kind of legal claim you make, even if we were warned
                something bad might happen.
              </p>
            </Callout>
            <Callout>
              <p>
                If you access, view, or request over 1,000 posts, including
                replies, videos, images, and more, in a 24-hour period, you will
                owe $500 for every 1,000 posts accessed. This fee is meant to
                cover estimated harm and does not replace other legal actions we
                might take.
              </p>
            </Callout>
          </div>

          <p className="mt-6 max-w-4xl">
            Non-Partisan Alliance, Inc. takes the security of user data and
            system resources very seriously. If you break these Terms or help
            someone else do it, you may be held legally and financially
            responsible. If violations continue, we may seek a court order to
            stop you, along with other legal and financial remedies.
          </p>
        </Section>

        <Section eyebrow="Sections 6-7" title="Disputes and Arbitration">
          <div className="max-w-4xl space-y-5">
            <p>
              By using this website, you agree to resolve any disputes through
              arbitration under the rules of the{" "}
              <a
                href="https://www.adr.org/"
                target="_blank"
                rel="noopener noreferrer"
                className={accentLinkClassName}
              >
                American Arbitration Association (AAA)
              </a>{" "}
              instead of in court.
            </p>
            <p>
              This Arbitration Agreement governs the resolution of disputes that
              may arise in connection with the use of our Services, website, or
              any other matter related to Non-Partisan Alliance Inc.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {arbitrationItems.map((item) => (
              <article
                key={item.title}
                className="rounded-lg border border-[#c4c4c4] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
              >
                <span className="flex size-12 items-center justify-center rounded-lg border border-[#9333EA] bg-[#eeeeee]">
                  <KeyRoundIcon
                    className="size-6 text-[#9333EA]"
                    aria-hidden="true"
                  />
                </span>
                <h3 className="mt-4 text-xl font-semibold leading-snug text-[#000000]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#1f1f1f]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Section 8"
          title="Intellectual Property Rights"
          surface="container"
        >
          <div className="max-w-4xl space-y-5">
            <p>
              Everything you see on the website, including text, images, videos,
              logos, and software, is owned by Non-Partisan Alliance Inc. or its
              partners. These items are protected by laws in the United States.
            </p>
            <p>
              You are allowed to use the website and its content only in the ways
              allowed by our{" "}
              <Link href="/terms" className={accentLinkClassName}>
                Terms
              </Link>
              ,{" "}
              <Link href="/userrules" className={accentLinkClassName}>
                User Rules
              </Link>
              , and{" "}
              <Link href="/privacy" className={accentLinkClassName}>
                Privacy Policy & Cookie
              </Link>
              . You do not own any content or logos just by using the site.
            </p>
            <p>
              We give you permission to use the website for your own personal,
              non-business use, and only for that purpose.
            </p>
          </div>
        </Section>

        <Section eyebrow="Section 9" title="Changes to This Agreement">
          <div className="max-w-4xl space-y-5">
            <p>
              Non-Partisan Alliance Inc. can change this agreement at any time.
              If we do, we will update the version posted at{" "}
              <Link href="/terms" className={accentLinkClassName}>
                www.townhallus.com/terms
              </Link>{" "}
              or let you know through our Services.
            </p>
            <p>
              We recommend checking this agreement from time to time. If you keep
              using our Services after changes are made, it means you accept
              them.
            </p>
            <p>
              If you do not agree with this agreement or any future changes, you
              should stop using Non-Partisan Alliance Inc. Services right away.
            </p>
          </div>
        </Section>

        <section className="border-t border-[#c4c4c4] bg-[#eeeeee]">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-[#999999] bg-[#f7f7f7]">
                <MailIcon className="size-6 text-[#4d4d4d]" />
              </span>
              <p className="min-w-0 text-base leading-7 text-[#000000] sm:text-lg">
                This page may be updated at any time without prior notice.
                Please check back regularly to stay informed. Questions can be
                sent to{" "}
                <a href={`mailto:${supportEmail}`} className={accentLinkClassName}>
                  {supportEmail}
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
