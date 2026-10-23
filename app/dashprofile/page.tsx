import type { Metadata } from "next";

import { DashboardPage } from "@/components/dashboard-page";

export const metadata: Metadata = {
  title: "Profile | TownHallUS.com",
  description:
    "Manage your TownHallUS.com profile, verification fields, location, and self-introduction.",
};

export default function DashProfilePage() {
  return <DashboardPage section="profile" />;
}
