import { getHeroImages } from "./actions";
import { StoryClient } from "./client";

// Admin data is per-request (session cookie) — never pre-render this page at build time
export const dynamic = "force-dynamic";

export default async function StoryPage() {
  const heroImages = await getHeroImages();
  return <StoryClient initialHeroImages={heroImages} />;
}
