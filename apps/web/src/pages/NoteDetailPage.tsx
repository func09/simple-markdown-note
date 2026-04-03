import { useParams } from "react-router-dom";
import { Notes } from "@/features/notes";

export default function NoteDetailPage() {
  const { noteId } = useParams();

  return (
    <div className="h-full w-full">
      <Notes selectedNoteId={noteId} />
    </div>
  );
}
