import Image from "next/image";

const californiaFlagSrc = "/flags/California.jpg";

export function StateFlagIcon({
  state,
}: Readonly<{
  state?: string;
}>) {
  if (state?.trim().toLowerCase() !== "california") {
    return null;
  }

  return (
    <Image
      src={californiaFlagSrc}
      alt=""
      width={24}
      height={16}
      className="h-4 w-6 shrink-0 rounded-[2px] border border-[#c4c4c4] object-cover"
    />
  );
}
