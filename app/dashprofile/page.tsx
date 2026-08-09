import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import DashProfileClient from "./dash-profile-client";

export const metadata: Metadata = {
  title: "Profile | TownHallUS.com",
  description:
    "Manage your TownHallUS.com profile, verification fields, location, and self-introduction.",
};

export default function DashProfilePage() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />
      <DashProfileClient />
      <SiteFooter />
    </div>
  );
}
