import type { Metadata } from "next";

import { DashboardPage } from "@/components/dashboard-page";

export const metadata: Metadata = {
  title: "My Comments | TownHallUS.com",
  description:
    "Review comments published from your TownHallUS account.",
};

export default function DashCommentPage() {
  return <DashboardPage section="comments" />;
}
