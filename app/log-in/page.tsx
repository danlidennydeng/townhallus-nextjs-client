import type { Metadata } from "next";

import LogInPageClient from "./log-in-page-client";

export const dynamic = "error";
export const revalidate = false;

export const metadata: Metadata = {
  title: "Log In | TownHallUS.com",
  description:
    "Log in to TownHallUS.com to access your profile and account dashboard.",
};

export default function LogInPage() {
  return <LogInPageClient />;
}
