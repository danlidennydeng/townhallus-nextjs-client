const fallbackAvatarSeed = "townhallus-user";

export function pixelAvatarPath(seed?: string | null) {
  const cleanSeed = seed?.trim() || fallbackAvatarSeed;

  return `/avatar/${encodeURIComponent(cleanSeed)}`;
}
