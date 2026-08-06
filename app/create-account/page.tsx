import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import CreateAccountClient from "./create-account-client";

export const metadata: Metadata = {
  title: "Create Account | TownHallUS.com",
  description:
    "Create a TownHallUS.com account and receive a six digit email verification code.",
};

export default function CreateAccountPage() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />
      <CreateAccountClient />
      <SiteFooter />
    </div>
  );
}
