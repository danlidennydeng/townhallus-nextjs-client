"use client";

import dynamic from "next/dynamic";

const CreatePostView = dynamic(() => import("./create-post-view"), {
  ssr: false,
  loading: () => (
    <main
      className="flex min-h-screen flex-1 items-center justify-center bg-[#e6e6e6] px-4 py-12"
      role="status"
    >
      <span className="font-semibold text-[#000000]">Loading editor...</span>
    </main>
  ),
});

export default function CreatePostPageClient() {
  return <CreatePostView />;
}
