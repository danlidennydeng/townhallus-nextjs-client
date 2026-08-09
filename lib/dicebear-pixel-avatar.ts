import "server-only";

import { Avatar, Style } from "@dicebear/core";
import pixelArt from "@dicebear/styles/pixel-art.json" with { type: "json" };

const pixelArtStyle = new Style(pixelArt);
const fallbackSeed = "townhallus-user";

export function normalizePixelAvatarSeed(seed: string) {
  const cleanSeed = seed.trim();

  if (!cleanSeed) {
    return fallbackSeed;
  }

  return cleanSeed.slice(0, 160);
}

export function createPixelAvatarSvg(seed: string, size = 128) {
  const avatar = new Avatar(pixelArtStyle, {
    seed: normalizePixelAvatarSeed(seed),
    size,
    backgroundColor: ["#e6e6e6"],
    borderRadius: 50,
  });

  return avatar.toString();
}
