import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function PostLoading() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-md border border-[#999999] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
            <div className="h-5 w-24 rounded-md bg-[#d6d6d6]" />
            <div className="mt-5 h-10 w-4/5 rounded-md bg-[#d6d6d6]" />
            <div className="mt-3 h-10 w-3/5 rounded-md bg-[#d6d6d6]" />
            <div className="mt-6 flex items-center gap-3">
              <div className="size-11 rounded-full bg-[#d6d6d6]" />
              <div className="space-y-2">
                <div className="h-5 w-40 rounded-md bg-[#d6d6d6]" />
                <div className="h-4 w-56 rounded-md bg-[#d6d6d6]" />
              </div>
            </div>
            <div className="mt-8 space-y-4">
              <div className="h-4 rounded-md bg-[#d6d6d6]" />
              <div className="h-4 rounded-md bg-[#d6d6d6]" />
              <div className="h-4 w-2/3 rounded-md bg-[#d6d6d6]" />
            </div>
          </section>
          <aside className="space-y-4">
            <div className="h-52 rounded-md border border-[#999999] bg-[#f7f7f7]" />
            <div className="h-72 rounded-md border border-[#999999] bg-[#eeeeee]" />
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
