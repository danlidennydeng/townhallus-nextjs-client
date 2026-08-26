import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function DashCommentLoading() {
  const cards = Array.from({ length: 6 }, (_, index) => index);

  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />
      <main className="flex flex-1 bg-[#e6e6e6] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto w-full max-w-[1280px] space-y-5">
          <section className="rounded-md border border-[#999999] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
            <div className="flex items-center justify-between gap-3">
              <div className="h-5 w-24 rounded-md bg-[#d6d6d6]" />
              <div className="h-5 w-28 rounded-md bg-[#d6d6d6]" />
            </div>
            <div className="mt-4 h-10 w-36 rounded-md bg-[#d6d6d6]" />
          </section>

          <section
            aria-label="Loading comments"
            className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {cards.map((card) => (
              <div
                key={card}
                className="min-h-[465px] w-full min-w-0 max-w-full overflow-hidden rounded-md border border-[#999999] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)]"
              >
                <div className="flex justify-between gap-3 border-b border-[#c4c4c4] pb-3">
                  <div className="h-4 w-32 rounded-md bg-[#d6d6d6]" />
                  <div className="h-4 w-4 rounded-md bg-[#d6d6d6]" />
                </div>
                <div className="mt-5 space-y-3">
                  <div className="h-7 rounded-md bg-[#d6d6d6]" />
                  <div className="h-7 rounded-md bg-[#d6d6d6]" />
                  <div className="h-7 w-2/3 rounded-md bg-[#d6d6d6]" />
                </div>
                <div className="mt-8 flex items-center gap-3 border-t border-[#c4c4c4] pt-4">
                  <div className="size-11 rounded-full bg-[#d6d6d6]" />
                  <div className="space-y-2">
                    <div className="h-4 w-36 rounded-md bg-[#d6d6d6]" />
                    <div className="h-4 w-24 rounded-md bg-[#d6d6d6]" />
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
