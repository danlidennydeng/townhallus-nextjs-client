
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://townhallus.com";

  const pages = [
    "",
    "/about",
    "/faqpage",
    "/helppage",
    "/privacy",
    "/terms",
    "/userrules",
  ];

  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
  }));
}
