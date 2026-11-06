"use client";

import dynamic from "next/dynamic";

const AccessDeniedView = dynamic(() => import("./access-denied-view"), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-screen items-center justify-center bg-[#e6e6e6] px-4 py-12">
      <p role="status" className="rounded-md border border-[#999999] bg-[#f7f7f7] px-5 py-4 font-semibold text-[#4d4d4d]">
        Loading access information...
      </p>
    </main>
  ),
});

export default function AccessDeniedPageClient() {
  return <AccessDeniedView />;
}
