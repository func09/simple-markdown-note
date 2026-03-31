"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/features/auth/api";

interface NotesProps {
  context: {
    type: "scope" | "tag";
    value: string;
  };
  selectedNoteId?: string;
}

export function Notes({ context, selectedNoteId }: NotesProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="relative flex h-screen flex-col items-center justify-center bg-white p-4">
      {/* Logout Button */}
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
        >
          Logout
        </button>
      </div>

      <h2 className="text-xl font-bold text-slate-800">Notes List</h2>
      <p className="text-slate-500">
        Type: {context.type === "scope" ? "Scope" : "Tag"} ({context.value})
      </p>
      {selectedNoteId && (
        <p className="text-slate-500">Selected Note ID: {selectedNoteId}</p>
      )}
      <div className="mt-4 animate-pulse rounded-lg bg-slate-100 p-8">
        Coming Soon...
      </div>
    </div>
  );
}
