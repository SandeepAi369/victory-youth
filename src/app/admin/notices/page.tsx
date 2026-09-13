import { getNotices } from "./actions";
import NoticesClient from "./client";

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const notices = await getNotices();
  return (
    <div className="w-full">
      <NoticesClient initialData={notices} />
    </div>
  );
}
