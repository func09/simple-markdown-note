import { useParams } from "react-router-dom";
import { AuthGuard } from "@/features/auth/components";
import { Notes } from "@/features/notes";

export default function NoteDetailPage() {
  const { noteId } = useParams();

  return (
    <AuthGuard>
      <div className="h-full w-full">
        <Notes selectedNoteId={noteId} />
      </div>
    </AuthGuard>
  );
}
