"use client";

import dynamic from "next/dynamic";

const NotFoundView = dynamic(() => import("./not-found-view"), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-screen items-center justify-center bg-[#e6e6e6] px-4 py-12">
      <p role="status" className="rounded-md border border-[#999999] bg-[#f7f7f7] px-5 py-4 font-semibold text-[#4d4d4d]">
        Loading page...
      </p>
    </main>
  ),
});

export default function NotFoundClient() {
  return <NotFoundView />;
}
