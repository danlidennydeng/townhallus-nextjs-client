import type { Metadata } from "next";

import NotFoundClient from "./not-found-client";

export const metadata: Metadata = {
  title: "Page not found | TownHallUS.com",
  description: "The page you are looking for does not exist or may have moved. Find your way back to TownHallUS.com.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundClient />;
}
