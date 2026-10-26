import type { Metadata } from "next";

import SearchPageClient from "./search-page-client";

export const dynamic = "error";
export const revalidate = false;

export const metadata: Metadata = {
  title: "Search Posts | TownHallUS.com",
  description: "Search TownHallUS posts by state, title, or content.",
};

export default function SearchPage() {
  return <SearchPageClient />;
}
