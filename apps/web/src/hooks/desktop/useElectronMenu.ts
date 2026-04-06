import {
  useCreateNote,
  useDeleteNote,
} from "@simple-markdown-note/api-client/hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotesStore } from "@/features/notes/store";
/**
 * デスクトップアプリ環境にて、Electronのネイティブメニューからのアクションを処理するフック。
 * メニュー経由での新規ノート作成やゴミ箱移動などのイベントリスナーを登録・破棄します。
 */
export function useElectronMenu() {
  const navigate = useNavigate();
  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote();

  const selectedNoteId = useNotesStore((s) => s.selectedNoteId);
  const setSelectedNoteId = useNotesStore((s) => s.setSelectedNoteId);
  const tag = useNotesStore((s) => s.filterTag);

  useEffect(() => {
    const electron = window.electron;
    if (!electron) return;

    // Handle New Note
    const removeNewNoteListener = electron.onNoteNew(async () => {
      try {
        const result = await createNoteMutation.mutateAsync({
          content: "",
          isPermanent: false,
          tags: tag ? [tag] : [],
        });
        setSelectedNoteId(result.id);
        navigate(`/notes/${result.id}`);
      } catch (error) {
        console.error("Failed to create note from menu:", error);
      }
    });

    // Handle Delete Note
    const removeDeleteNoteListener = electron.onNoteDelete(async () => {
      if (!selectedNoteId) return;
      if (confirm("Are you sure you want to move this note to trash?")) {
        try {
          await deleteNoteMutation.mutateAsync(selectedNoteId);
          navigate("/notes");
        } catch (error) {
          console.error("Failed to delete note from menu:", error);
        }
      }
    });

    return () => {
      removeNewNoteListener();
      removeDeleteNoteListener();
    };
  }, [
    createNoteMutation,
    deleteNoteMutation,
    navigate,
    selectedNoteId,
    setSelectedNoteId,
    tag,
  ]);
}
