import type { Metadata } from "next";

import VerifyEmailPageClient from "./verify-email-page-client";

export const dynamic = "error";
export const revalidate = false;

export const metadata: Metadata = {
  title: "Verify Email | TownHallUS.com",
  description:
    "Enter the six digit verification code sent to your email address.",
};

export default function VerifyEmailPage() {
  return <VerifyEmailPageClient />;
}
