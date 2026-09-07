export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getEvents } from "./actions";
import { EventsClient } from "./client";

export default async function AdminEventsPage() {
  const events = await getEvents();
  
  return (
    <div className="w-full">
      <EventsClient events={events} />
    </div>
  );
}
