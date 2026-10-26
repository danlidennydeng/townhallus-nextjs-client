import type { Metadata } from "next";

import CreateAccountPageClient from "./create-account-page-client";

export const dynamic = "error";
export const revalidate = false;

export const metadata: Metadata = {
  title: "Create Account | TownHallUS.com",
  description:
    "Create a TownHallUS.com account and receive a six digit email verification code.",
};

export default function CreateAccountPage() {
  return <CreateAccountPageClient />;
}
