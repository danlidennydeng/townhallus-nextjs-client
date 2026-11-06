import type { Metadata } from "next";

import AccessDeniedPageClient from "./access-denied-page-client";

export const dynamic = "error";
export const revalidate = false;

export const metadata: Metadata = {
  title: "Access Restricted | TownHallUS.com",
  description: "This website is only available to users in the United States.",
  robots: { index: false, follow: true },
};

export default function AccessDeniedPage() {
  return <AccessDeniedPageClient />;
}
