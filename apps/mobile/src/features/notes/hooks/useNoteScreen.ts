import {
  useCreateNote,
  useDeleteNote,
  useLogout,
  useNote,
  useNotes,
  usePermanentDelete,
  useRestoreNote,
  useTags,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import { NOTE_SCOPE, type NoteScope } from "@simple-markdown-note/common/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../auth/store";
import { AUTO_SAVE_DELAY, NAVIGATION_DELAY } from "../constants";
import { useKeyboardObserver } from "./useNoteEffect";
import {
  useNoteCheckbox,
  useNoteEditorState,
  useNoteFilter,
} from "./useNoteLogic";
import { useDrawerState, useTagPrompt } from "./useNoteState";

// ---------------------------------------------------------------------------
// Private: 算出関数
// ---------------------------------------------------------------------------

export function calcNoteMetrics(content: string) {
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  return { wordCount, charCount };
}

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
// Private: 削除・復元操作の共通パターンをまとめたフック
// ---------------------------------------------------------------------------

function useNoteDelete({
  setIsDeleting,
  infoSheetRef,
  handleGoBack,
}: {
  setIsDeleting: (v: boolean) => void;
  infoSheetRef: { current: { dismiss(): void } | null };
  handleGoBack: () => void;
}) {
  return useCallback(
    async (action: () => Promise<unknown>, label: string) => {
      setIsDeleting(true);
      try {
        await action();
        infoSheetRef.current?.dismiss();
        setTimeout(handleGoBack, NAVIGATION_DELAY);
      } catch (error) {
        setIsDeleting(false);
        console.error(`Failed to ${label}:`, error);
      }
    },
    [setIsDeleting, infoSheetRef, handleGoBack]
  );
}

// ---------------------------------------------------------------------------
// Public hooks
// ---------------------------------------------------------------------------

/**
 * ノート一覧画面の全体を統合するフック。
 * Resourceからデータを受け取り、Logicでフィルタリングし、UIへのアクションを伝達します。
 */
export function useNoteListScreen() {
  const router = useRouter();
  const { scope = NOTE_SCOPE.ALL, tag } = useLocalSearchParams<{
    scope?: string;
    tag?: string;
  }>();
  const [searchQuery, setSearchQuery] = useState("");

  // Resource
  const {
    data: notes = [],
    isLoading: isNotesLoading,
    refetch: refetchNotes,
  } = useNotes({ scope: scope as NoteScope, tag });

  const { data: apiTags = [] } = useTags();
  const tags = apiTags.map((t) => t.name);

  // Logic
  const { filteredNotes } = useNoteFilter(notes, searchQuery);

  // Platform
  const { isDrawerOpen, slideAnim, toggleDrawer } = useDrawerState();

  const getHeaderTitle = () => {
    if (tag) return tag;
    if (scope === NOTE_SCOPE.TRASH) return "Trash";
    if (scope === NOTE_SCOPE.UNTAGGED) return "Untagged";
    return "All Notes";
  };

  const handleSelectScope = useCallback(
    (newScope: string) => {
      toggleDrawer(false);
      router.setParams({ scope: newScope, tag: undefined });
    },
    [toggleDrawer, router]
  );

  const handleSelectTag = useCallback(
    (newTag: string) => {
      toggleDrawer(false);
      router.setParams({ tag: newTag, scope: undefined });
    },
    [toggleDrawer, router]
  );

  const handleNewNote = useCallback(
    () => router.push("/(main)/notes/new"),
    [router]
  );
  const handleSelectNote = useCallback(
    (id: string) => router.push(`/(main)/notes/${id}`),
    [router]
  );

  return {
    notes: filteredNotes,
    isNotesLoading,
    refetchNotes,
    tags,
    searchQuery,
    setSearchQuery,
    isDrawerOpen,
    toggleDrawer,
    slideAnim,
    scope,
    tag,
    getHeaderTitle,
    handleSelectScope,
    handleSelectTag,
    handleNewNote,
    handleSelectNote,
  };
}

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
  const { toggleCheckboxInContent } = useNoteCheckbox();
  const metrics = useMemo(() => calcNoteMetrics(content), [content]);

  const handleGoBack = useCallback(() => router.back(), [router]);
  const executeDelete = useNoteDelete({
    setIsDeleting,
    infoSheetRef: uiLayout.infoSheetRef,
    handleGoBack,
  });

  // Handlers
  const handleCheckboxToggle = useCallback(
    (index: number) => {
      setContent((prev) => toggleCheckboxInContent(prev, index));
    },
    [toggleCheckboxInContent, setContent]
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
    return executeDelete(
      action,
      note?.deletedAt ? "restore note" : "trash note"
    );
  }, [currentNoteId, note, mutations, executeDelete]);

  const handlePermanentDelete = useCallback(() => {
    const activeId = currentNoteId.current;
    if (!activeId) return;
    return executeDelete(
      () => mutations.permanentDelete(activeId),
      "permanently delete note"
    );
  }, [currentNoteId, mutations, executeDelete]);

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
