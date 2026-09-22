import { getHeroImages } from "./actions";
import { StoryClient } from "./client";

export default async function StoryPage() {
  const heroImages = await getHeroImages();
  return <StoryClient initialHeroImages={heroImages} />;
}
