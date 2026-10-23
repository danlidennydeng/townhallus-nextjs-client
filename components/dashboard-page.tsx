"use client";

import dynamic from "next/dynamic";

export type DashboardSection = "profile" | "posts" | "comments";

const DashboardClient = dynamic(() => import("@/components/dashboard-client"), {
  ssr: false,
  loading: () => (
    <main
      className="flex min-h-screen flex-1 items-center justify-center bg-[#e6e6e6] px-4 py-12"
      role="status"
    >
      <span className="font-semibold text-[#000000]">Loading dashboard...</span>
    </main>
  ),
});

export function DashboardPage({
  section,
}: Readonly<{ section: DashboardSection }>) {
  return <DashboardClient section={section} />;
}
