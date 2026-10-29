import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Indexable section pages only. Per-person pages (/contributor/[id], /members/[id])
// and the noindex /members listing are left out on purpose so search engines are
// not pointed at individual people or sent mixed signals.
const PUBLIC_PATHS = [
  "",
  "/chanda",
  "/donations",
  "/active-members",
  "/events",
  "/gallery",
  "/notices",
  "/notes",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PUBLIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
