import { LoaderCircleIcon } from "lucide-react";

export default function SearchLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e6e6e6] px-4 py-12">
      <p role="status" className="flex items-center gap-3 rounded-md border border-[#999999] bg-[#f7f7f7] px-5 py-4 font-semibold">
        <LoaderCircleIcon className="size-5 animate-spin text-[#9333EA]" aria-hidden="true" />
        Searching posts...
      </p>
    </main>
  );
}
