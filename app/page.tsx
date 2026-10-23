import { HomeLayoutDesign } from "@/components/home-layout-candidates";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const statementCardClassName =
  "h-full min-w-0 rounded-md border border-[#c4c4c4] bg-[#f7f7f7] p-5 text-lg leading-8 text-[#1f1f1f] shadow-[0_1px_2px_rgba(0,0,0,0.14)]";

export default function Home() {
  return (
    <HomeLayoutDesign
      variant="action"
      secondSection={
        <section
          aria-label="About TownhallUS.com"
          className="bg-[#e6e6e6] px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
        >
          <div className="mx-auto grid w-full max-w-[1280px] gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <p className={statementCardClassName}>
              We advocate for{" "}
              <strong>
                freedom of speech, honest dialogue, democracy, and unity
              </strong>.
            </p>
            <p className={statementCardClassName}>
              We encourage you to focus on <strong>statewide issues</strong>.
              However, we can discuss nationwide issues here as well.
            </p>
            <p className={statementCardClassName}>
              We{" "}
              <strong>
                protect you from foreign influences and foreign propaganda
              </strong>{" "}
              by blocking all foreign IP addresses.
            </p>
            <p className={statementCardClassName}>
              You will be exposed to perspectives from all sides.{" "}
              <strong>No misuse of Artificial Intelligence</strong> to send you
              only favored views.
            </p>
            <p className={statementCardClassName}>
              You can <strong>bridge political divides</strong> and{" "}
              <strong>think critically about diverse media</strong> all while
              keeping an open mind and staying anonymous.
            </p>
          </div>
        </section>
      }
    />
  );
}
