import type { Metadata } from "next";

import { DashboardPage } from "@/components/dashboard-page";

export const metadata: Metadata = {
  title: "My Posts | TownHallUS.com",
  description:
    "Review posts published from your TownHallUS account.",
};

export default function DashPostsPage() {
  return <DashboardPage section="posts" />;
}
