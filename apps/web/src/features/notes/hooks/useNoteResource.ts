import { useNote, useNotes } from "@simple-markdown-note/api-client/hooks";
import type { NoteScope } from "@simple-markdown-note/common/types";

/**
 * ノート一覧を取得するリソースフック
 */
export function useNoteListQuery(scope: NoteScope = "all", tag?: string) {
  const { data: notes = [], isLoading } = useNotes({
    scope,
    tag: tag || undefined,
  });
  return { notes, isLoading };
}

/**
 * 指定したIDのノート詳細を取得するリソースフック
 */
export function useNoteDetailQuery(id: string | null) {
  const { data: note, isLoading } = useNote(id, {
    enabled: !!id,
  });
  return { note, isLoading };
}
