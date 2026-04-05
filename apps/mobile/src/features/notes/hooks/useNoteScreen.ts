import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { executeNoteDelete, toggleCheckboxInContent } from "../utils";
import { useNoteEditor } from "./useNoteDomain";
import { useKeyboardObserver } from "./useNoteEffect";
import { useTagPrompt } from "./useNoteState";

/**
 * ノート編集画面を統合するフック。
 * ローカルのテキスト状態の保持と自動保存メカニズムの統合を行います。
 */
export function useNoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();

  // Domain logic
  const {
    note,
    mutations,
    metrics,
    content,
    setContent,
    tags,
    setTags,
    isPreview,
    setIsPreview,
    setIsDeleting,
    currentNoteId,
  } = useNoteEditor(id, isNew);

  // Platform
  const uiLayout = useKeyboardObserver(isPreview, setIsPreview);
  const { promptForTag } = useTagPrompt();

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
