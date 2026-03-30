"use client";

import { useParams } from "next/navigation";

interface NotesProps {
  context: {
    type: "system" | "tag";
    value: string;
  };
  selectedNoteId?: string;
}

export function Notes({ context, selectedNoteId }: NotesProps) {
  const params = useParams();
  const filter = params.filter as string;
  const noteId = params.noteId as string[] | undefined;

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white p-4">
      <h2 className="text-xl font-bold text-slate-800">Notes List</h2>
      <p className="text-slate-500">Filter: {filter}</p>
      {noteId && <p className="text-slate-500">Note ID: {noteId.join("/")}</p>}
      <div className="mt-4 animate-pulse rounded-lg bg-slate-100 p-8">
        Coming Soon...
      </div>
    </div>
  );
}
