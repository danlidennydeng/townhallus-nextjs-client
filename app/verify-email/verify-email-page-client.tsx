"use client";

import dynamic from "next/dynamic";

const VerifyEmailView = dynamic(() => import("./verify-email-view"), {
  ssr: false,
  loading: () => (
    <main
      className="flex min-h-screen flex-1 items-center justify-center bg-[#e6e6e6] px-4 py-12"
      role="status"
    >
      <span className="font-semibold text-[#000000]">Loading verification...</span>
    </main>
  ),
});

export default function VerifyEmailPageClient() {
  return <VerifyEmailView />;
}
