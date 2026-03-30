import { notFound } from "next/navigation";
import { z } from "zod";
import { NotesContainer } from "@/features/notes";

// 許可するシステムフィルターを定義
const FilterSchema = z.enum(["all", "trash", "untagged"]);

interface SystemNotesPageProps {
  params: Promise<{
    filter: string;
    noteId?: string[];
  }>;
}

/**
 * システムノートページ (Server Component)
 * フィルタ (all, trash, untagged) と、オプションのノートIDを処理します。
 */
export default async function SystemNotesPage({
  params,
}: SystemNotesPageProps) {
  const { filter, noteId } = await params;

  // バリデーション：許可されたフィルターでなければ 404
  const result = FilterSchema.safeParse(filter);
  if (!result.success) {
    notFound();
  }

  const validFilter = result.data;
  // noteId は配列（[[...noteId]]）なので、最初の要素を取得
  const currentNoteId = noteId?.[0];

  return (
    <div className="container mx-auto py-8">
      <NotesContainer
        context={{ type: "system", value: validFilter }}
        selectedNoteId={currentNoteId}
      />
    </div>
  );
}
