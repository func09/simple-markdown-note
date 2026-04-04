import { AuthGuard } from "@/features/auth/components";
import { NotesIndexScreen } from "@/features/notes";

export default function NotesPage() {
  return (
    <AuthGuard>
      <div className="h-full w-full">
        <NotesIndexScreen />
      </div>
    </AuthGuard>
  );
}
