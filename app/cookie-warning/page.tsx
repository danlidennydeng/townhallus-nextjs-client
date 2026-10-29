import type { Metadata } from "next";

import CookieWarningPageClient from "./cookie-warning-page-client";

export const dynamic = "error";
export const revalidate = false;

export const metadata: Metadata = {
  title: "Cookie Settings | TownHallUS.com",
  description: "Review and change your optional analytics and advertising cookie preference for TownHallUS.com.",
};

export default function CookieWarningPage() {
  return <CookieWarningPageClient />;
}
