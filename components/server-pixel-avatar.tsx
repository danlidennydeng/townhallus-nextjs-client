import Image from "next/image";

import { pixelAvatarPath } from "@/lib/avatar";

type ServerPixelAvatarProps = {
  seed: string;
  alt: string;
  size?: number;
  priority?: boolean;
  className?: string;
};

export function ServerPixelAvatar({
  seed,
  alt,
  size = 128,
  priority = false,
  className,
}: Readonly<ServerPixelAvatarProps>) {
  return (
    <Image
      src={pixelAvatarPath(seed)}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      unoptimized
      className={className}
    />
  );
}
