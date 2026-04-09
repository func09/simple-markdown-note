import { useNotes } from "@simple-markdown-note/api-client/hooks";
import { useNotesStore } from "@/features/notes/store";
import { useNotesFilter } from "../states";

/**
 * 検索・フィルタリングされたノート一覧と、それらに関連する状態を管理するHook
 */
export function useFilteredNotes() {
  "use memo";
  const searchQuery = useNotesStore((s) => s.searchQuery);
  const setSearchQuery = useNotesStore((s) => s.setSearchQuery);
  const scope = useNotesStore((s) => s.filterScope);
  const tag = useNotesStore((s) => s.filterTag);
  const setSelectedNoteId = useNotesStore((s) => s.setSelectedNoteId);

  const { data: notes = [], isLoading } = useNotes({
    scope,
    tag: tag || undefined,
  });

  const filteredNotes = notes.filter((note) =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const shouldShowSkeleton = isLoading && notes.length === 0;

  const queryString = useNotesFilter();

  return {
    notes,
    filteredNotes,
    isLoading,
    shouldShowSkeleton,
    searchQuery,
    setSearchQuery,
    setSelectedNoteId,
    scope,
    tag,
    queryString,
  };
}
