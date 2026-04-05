import {
  useCreateNote,
  useDeleteNote,
  useLogout,
  useNote,
  usePermanentDelete,
  useRestoreNote,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { useAuthStore } from "../../auth/store";
import { AUTO_SAVE_DELAY } from "../constants";
import {
  calcNoteMetrics,
  executeNoteDelete,
  toggleCheckboxInContent,
} from "../utils";
import { useKeyboardObserver } from "./useNoteEffect";
import { useNoteEditorState, useTagPrompt } from "./useNoteState";

// ---------------------------------------------------------------------------
// Private: 自動保存の副作用を担うフック
// ---------------------------------------------------------------------------

function useNoteAutoSave({
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
}: {
  content: string;
  tags: string[];
  isNew: boolean;
  note: ReturnType<typeof useNote>["data"];
  isLoading: boolean;
  isDeleting: boolean;
  mutations: {
    createNote: ReturnType<typeof useCreateNote>["mutateAsync"];
    updateNote: ReturnType<typeof useUpdateNote>["mutate"];
  };
  router: ReturnType<typeof useRouter>;
  currentNoteId: { current: string | null };
  markAsInitialized: (id: string) => void;
}) {
  useEffect(() => {
    if (isLoading || isDeleting) return;
    if (!content.trim() && isNew) return;

    const timer = setTimeout(async () => {
      const activeId = currentNoteId.current;

      if (isNew && !activeId) {
        try {
          const result = await mutations.createNote({
            content,
            tags,
            isPermanent: false,
          });
          markAsInitialized(result.id);
          router.setParams({ id: result.id });
        } catch (error) {
          console.error("Failed to create note:", error);
        }
      } else if (activeId) {
        if (
          note &&
          (content !== note.content ||
            JSON.stringify(tags) !==
              JSON.stringify(note.tags.map((t) => t.name)))
        ) {
          mutations.updateNote({ id: activeId, data: { content, tags } });
        }
      }
    }, AUTO_SAVE_DELAY);

    return () => clearTimeout(timer);
  }, [
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
  ]);
}

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

/**
 * サイドドロワー画面を統合するフック。
 */
export function useNoteDrawerScreen(onClose: () => void) {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const logoutMutation = useLogout({
    onSuccess: () => {
      onClose();
      clearAuth();
    },
  });

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  return {
    handleLogout,
  };
}
