import type { Metadata } from "next";

import CreatePostPageClient from "./create-post-page-client";

export const dynamic = "error";
export const revalidate = false;

export const metadata: Metadata = {
  title: "Create Post | TownHallUS.com",
  description:
    "Create a TownHallUS.com post with statewide or nationwide scope.",
};

export default function CreatePostPage() {
  return <CreatePostPageClient />;
}
