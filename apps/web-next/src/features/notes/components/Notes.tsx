"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLogout } from "@/features/auth/queries";

interface NotesProps {
  context: {
    type: "scope" | "tag";
    value: string;
  };
  selectedNoteId?: string;
}

export function Notes({ context, selectedNoteId }: NotesProps) {
  const router = useRouter();
  const { mutate } = useLogout();

  const handleLogout = () => {
    mutate(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully");
        router.push("/login");
      },
      onError: (err: Error) => {
        toast.error(err.message || "Logout failed");
      },
    });
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
