import { getNotes } from "../notices/actions";
import NotesClient from "./client";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const notes = await getNotes();
  return (
    <div className="w-full">
      <NotesClient initialData={notes} />
    </div>
  );
}
