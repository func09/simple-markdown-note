import {
  useCreateNote,
  useDeleteNote,
  useNote,
  usePermanentDelete,
  useRestoreNote,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  calcNoteMetrics,
  executeNoteDelete,
  toggleCheckboxInContent,
} from "../utils";
import { useKeyboardObserver, useNoteAutoSave } from "./useNoteEffect";
import { useNoteEditorState, useTagPrompt } from "./useNoteState";

// ---------------------------------------------------------------------------
// Public hooks
// ---------------------------------------------------------------------------

/**
 * ノート編集画面を統合するフック。
 * ローカルのテキスト状態の保持と自動保存メカニズムの統合を行います。
 */
export function useNoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();

  // Resource
  const { data: note, isLoading } = useNote(isNew ? null : id);
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const restoreNoteMutation = useRestoreNote();
  const permanentDeleteMutation = usePermanentDelete();

  const mutations = useMemo(
    () => ({
      createNote: createNoteMutation.mutateAsync,
      updateNote: updateNoteMutation.mutate,
      deleteNote: deleteNoteMutation.mutateAsync,
      restoreNote: restoreNoteMutation.mutateAsync,
      permanentDelete: permanentDeleteMutation.mutateAsync,
    }),
    [
      createNoteMutation.mutateAsync,
      updateNoteMutation.mutate,
      deleteNoteMutation.mutateAsync,
      restoreNoteMutation.mutateAsync,
      permanentDeleteMutation.mutateAsync,
    ]
  );

  // State（初期化・サーバーデータとの同期を含む）
  const {
    content,
    setContent,
    tags,
    setTags,
    isPreview,
    setIsPreview,
    isDeleting,
    setIsDeleting,
    currentNoteId,
    markAsInitialized,
  } = useNoteEditorState(note, isNew);

  // Auto-save
  useNoteAutoSave({
    content,
    tags,
    isNew,
    note,
    isLoading,
    isDeleting,
    mutations,
    router,
    currentNoteId,
    markAsInitialized,
  });

  // Platform
  const uiLayout = useKeyboardObserver(isPreview, setIsPreview);
  const { promptForTag } = useTagPrompt();

  // Logic
  const metrics = useMemo(() => calcNoteMetrics(content), [content]);

  const handleGoBack = useCallback(() => router.back(), [router]);

  // Handlers
  const handleCheckboxToggle = useCallback(
    (index: number) => {
      setContent((prev) => toggleCheckboxInContent(prev, index));
    },
    [setContent]
  );

  const handleAddTag = useCallback(() => {
    promptForTag(tags, (newTag) => setTags((prev) => [...prev, newTag]));
  }, [promptForTag, tags, setTags]);

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      setTags((prev) => prev.filter((t) => t !== tagToRemove));
    },
    [setTags]
  );

  const handleTrashAction = useCallback(() => {
    const activeId = currentNoteId.current;
    if (!activeId) return;
    const action = note?.deletedAt
      ? () => mutations.restoreNote(activeId)
      : () => mutations.deleteNote(activeId);
    return executeNoteDelete(
      action,
      note?.deletedAt ? "restore note" : "trash note",
      { setIsDeleting, infoSheetRef: uiLayout.infoSheetRef, handleGoBack }
    );
  }, [
    currentNoteId,
    note,
    mutations,
    setIsDeleting,
    uiLayout.infoSheetRef,
    handleGoBack,
  ]);

  const handlePermanentDelete = useCallback(() => {
    const activeId = currentNoteId.current;
    if (!activeId) return;
    return executeNoteDelete(
      () => mutations.permanentDelete(activeId),
      "permanently delete note",
      { setIsDeleting, infoSheetRef: uiLayout.infoSheetRef, handleGoBack }
    );
  }, [
    currentNoteId,
    mutations,
    setIsDeleting,
    uiLayout.infoSheetRef,
    handleGoBack,
  ]);

  return {
    isNew,
    note,
    content,
    setContent,
    tags,
    isPreview,
    setIsPreview,
    metrics,
    ui: {
      isKeyboardVisible: uiLayout.isKeyboardVisible,
      inputRef: uiLayout.inputRef,
      infoSheetRef: uiLayout.infoSheetRef,
      handleKeyboardToggle: uiLayout.handleKeyboardToggle,
      handleGoBack,
    },
    ops: {
      handleCheckboxToggle,
      handleAddTag,
      handleRemoveTag,
      handleTrashAction,
      handlePermanentDelete,
    },
  };
}
