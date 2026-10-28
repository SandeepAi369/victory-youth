import type { Metadata } from "next";

// Placeholder page: kept out of search results until it has a real schedule.
export const metadata: Metadata = { title: "Event Schedule", robots: { index: false, follow: true } };

export default function SchedulePage() {
  return (
    <div className="p-20 text-center">
      <h1 className="text-4xl font-bold font-heading">Event Schedule</h1>
      <p className="mt-4 text-muted-foreground">Coming soon...</p>
    </div>
  );
}
