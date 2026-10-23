"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashPostsAliasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashpost");
  }, [router]);

  return (
    <main
      className="flex min-h-screen flex-1 items-center justify-center bg-[#e6e6e6] px-4 py-12"
      role="status"
    >
      <span className="font-semibold text-[#000000]">Opening My Posts...</span>
    </main>
  );
}
