"use client";

import dynamic from "next/dynamic";

import SearchLoading from "./loading";

const SearchView = dynamic(() => import("./search-view"), {
  ssr: false,
  loading: SearchLoading,
});

export default function SearchPageClient() {
  return <SearchView />;
}
