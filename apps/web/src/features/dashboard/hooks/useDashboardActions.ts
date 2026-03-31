import type { Note } from "api";
import { useCallback } from "react";
import { toast } from "sonner";
import { useDashboardStore } from "../../../features/dashboard/stores";
import {
  useCreateNote,
  useDeleteNote,
  useEmptyTrash,
  usePermanentDeleteNote,
  useRestoreNote,
  useUpdateNote,
} from "../../../features/notes/hooks";
import { useNoteStore } from "../../../features/notes/stores";

/**
 * ノートに関する各種アクション（作成、論理・物理削除、復元、タグ更新など）を処理するためのカスタムフック
 * APIミューテーションをラップし、アプリのローカル状態管理 (`useNoteStore`) や トースト通知 との連携を一元化しています。
 *
 * 機能一覧:
 * - 新規ノート作成
 * - 特定のノートの通常削除（ゴミ箱へ） / 永久削除
 * - ゴミ箱からの復元、及びゴミ箱を空にする処理
 * - モーダルの開閉状態の管理
 */
export const useDashboardActions = () => {
  const { selectedNoteId, setSelectedNoteId } = useNoteStore();
  const {
    selectedTag,
    isTrashSelected,
    setActiveView,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    noteToDelete,
    setNoteToDelete,
  } = useDashboardStore();

  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote();
  const restoreNoteMutation = useRestoreNote();
  const permanentDeleteNoteMutation = usePermanentDeleteNote();
  const emptyTrashMutation = useEmptyTrash();
  const updateNoteMutation = useUpdateNote();

  /**
   * 新規ノートを作成し、エディタ（モバイル時は該当ビュー）へ遷移するハンドラー
   * 選択中のタグがあれば、デフォルトでそのタグが付与されます
   */
  const handleCreateNote = useCallback(async () => {
    try {
      const resp = await createNoteMutation.mutateAsync({
        content: "",
        tags:
          selectedTag && selectedTag !== "__untagged__" ? [selectedTag] : [],
      });
      const newNote = resp as Note;
      setSelectedNoteId(newNote.id);
      setActiveView("editor");
      toast.success("Note created");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create note");
    }
  }, [createNoteMutation, selectedTag, setSelectedNoteId, setActiveView]);

  /**
   * ノート削除ボタン押下時のハンドラー
   * 即時削除せず、削除確認モーダルを表示させるための状態をセットします
   * @param id 削除対象のノートID
   */
  const handleDeleteClick = useCallback(
    (id: string) => {
      setNoteToDelete(id);
      setIsDeleteModalOpen(true);
    },
    [setIsDeleteModalOpen, setNoteToDelete]
  );

  /**
   * モーダルでの削除確定処理
   * ゴミ箱表示中の場合は永久削除（物理削除）、通常一覧表示中の場合はゴミ箱へ移動（論理削除）させます
   */
  const confirmDeleteNote = useCallback(async () => {
    if (!noteToDelete) return;
    try {
      if (isTrashSelected) {
        await permanentDeleteNoteMutation.mutateAsync(noteToDelete);
        toast.success("Note permanently deleted");
      } else {
        await deleteNoteMutation.mutateAsync(noteToDelete);
        toast.success("Note moved to trash");
      }

      if (selectedNoteId === noteToDelete) {
        setSelectedNoteId(null);
        setActiveView("list");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        isTrashSelected
          ? "Failed to permanently delete note"
          : "Failed to delete note"
      );
    } finally {
      setIsDeleteModalOpen(false);
      setNoteToDelete(null);
    }
  }, [
    deleteNoteMutation,
    permanentDeleteNoteMutation,
    isTrashSelected,
    noteToDelete,
    selectedNoteId,
    setSelectedNoteId,
    setActiveView,
    setIsDeleteModalOpen,
    setNoteToDelete,
  ]);

  /**
   * ゴミ箱に入っている特定のノートを復元するハンドラー
   * @param id 復元対象のノートID
   */
  const handleRestoreNote = useCallback(
    async (id: string) => {
      try {
        await restoreNoteMutation.mutateAsync(id);
        toast.success("Note restored");
      } catch (err) {
        console.error(err);
        toast.error("Failed to restore note");
      }
    },
    [restoreNoteMutation]
  );

  /**
   * ゴミ箱内のすべてのノートを空にする（永久削除する）ハンドラー
   */
  const handleEmptyTrash = useCallback(async () => {
    try {
      await emptyTrashMutation.mutateAsync();
      setSelectedNoteId(null);
      setActiveView("list");
      toast.success("Trash emptied");
    } catch (err) {
      console.error(err);
      toast.error("Failed to empty trash");
    }
  }, [emptyTrashMutation, setSelectedNoteId, setActiveView]);

  /**
   * ノートのタグ情報を更新するハンドラー
   * @param noteId 更新対象のノートID
   * @param tags 新しいタグの文字列配列
   */
  const handleUpdateTags = useCallback(
    async (noteId: string, tags: string[]) => {
      try {
        await updateNoteMutation.mutateAsync({
          id: noteId,
          data: { tags },
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to sync tags");
      }
    },
    [updateNoteMutation]
  );

  return {
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    noteToDelete,
    handleCreateNote,
    handleDeleteClick,
    confirmDeleteNote,
    handleRestoreNote,
    handleEmptyTrash,
    handleUpdateTags,
  };
};
