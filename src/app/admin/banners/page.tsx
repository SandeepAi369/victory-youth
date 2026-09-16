import { getBanners } from "./actions";
import { BannersClient } from "./client";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const banners = await getBanners();
  return <BannersClient banners={banners} />;
}
