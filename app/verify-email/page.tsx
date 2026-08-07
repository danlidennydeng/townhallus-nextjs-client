import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import VerifyEmailClient from "./verify-email-client";

export const metadata: Metadata = {
  title: "Verify Email | TownHallUS.com",
  description:
    "Enter the six digit verification code sent to your email address.",
};

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden bg-[#e6e6e6] text-[#000000]">
      <SiteHeader />
      <VerifyEmailClient />
      <SiteFooter />
    </div>
  );
}
