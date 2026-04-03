import { AuthGuard } from "@/features/auth/components";
import { Notes } from "@/features/notes";

export default function NotesPage() {
  return (
    <AuthGuard>
      <div className="h-full w-full">
        <Notes />
      </div>
    </AuthGuard>
  );
}
