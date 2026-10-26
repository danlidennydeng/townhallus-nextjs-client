"use client";

import dynamic from "next/dynamic";

const LogInView = dynamic(() => import("./log-in-view"), {
  ssr: false,
  loading: () => (
    <main
      className="flex min-h-screen flex-1 items-center justify-center bg-[#e6e6e6] px-4 py-12"
      role="status"
    >
      <span className="font-semibold text-[#000000]">Loading log in...</span>
    </main>
  ),
});

export default function LogInPageClient() {
  return <LogInView />;
}
