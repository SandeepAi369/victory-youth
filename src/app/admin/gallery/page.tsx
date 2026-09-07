export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getGallery } from "./actions";
import { GalleryClient } from "./client";

export default async function AdminGalleryPage() {
  const gallery = await getGallery();
  
  return (
    <div className="w-full">
      <GalleryClient gallery={gallery} />
    </div>
  );
}
