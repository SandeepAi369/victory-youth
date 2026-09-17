import { getStoryImage } from "./actions";
import { StoryClient } from "./client";

export const dynamic = "force-dynamic";

export default async function StoryPage() {
  const story = await getStoryImage();
  return <StoryClient story={story} />;
}
