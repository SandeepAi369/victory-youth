import { getStoryImage, getHeroImages } from "./actions";
import { StoryClient } from "./client";

export default async function StoryPage() {
  const story = await getStoryImage();
  const heroImages = await getHeroImages();

  return (
    <StoryClient
      initialStory={{
        url: story.url,
        publicId: story.publicId,
        alt: story.alt,
      }}
      initialHeroImages={heroImages}
    />
  );
}
