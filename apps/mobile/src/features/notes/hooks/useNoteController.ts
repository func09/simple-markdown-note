import { useLogout } from "@simple-markdown-note/api-client/hooks";
import { NOTE_SCOPE, type NoteScope } from "@simple-markdown-note/common/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../auth/store";
import { useNoteCheckbox, useNoteFilter, useNoteMetrics } from "./useNoteLogic";
import {
  useNoteDrawerAnimation,
  useNoteEditorLayout,
  useTagPrompt,
} from "./useNotePlatform";
import {
  useNoteDetailQuery,
  useNoteListQuery,
  useNoteMutations,
} from "./useNoteResource";

const AUTO_SAVE_DELAY = 1000;
const NAVIGATION_DELAY = 250;

/**
 * ノート一覧画面の全体の司令塔となるコントローラーフック。
 * Resourceからデータを受け取り、Logicでフィルタリングし、UIへのアクションを伝達します。
 */
export function useNoteListController() {
  const router = useRouter();
  const { scope = NOTE_SCOPE.ALL, tag } = useLocalSearchParams<{
    scope?: string;
    tag?: string;
  }>();
  const [searchQuery, setSearchQuery] = useState("");

  // Resource
  const { notes, isNotesLoading, refetchNotes, tags } = useNoteListQuery(
    scope as NoteScope,
    tag
  );

  // Logic
  const { filteredNotes } = useNoteFilter(notes, searchQuery);

  // Platform
  const { isDrawerOpen, slideAnim, toggleDrawer } = useNoteDrawerAnimation();

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
 * ノート編集画面の司令塔となるコントローラーフック。
 * ローカルのテキスト状態の保持と自動保存メカニズムの統合を行います。
 */
export function useNoteEditorController() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();

  // Resource
  const { note, isLoading } = useNoteDetailQuery(isNew ? null : id);
  const mutations = useNoteMutations();

  // State
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const initializedId = useRef<string | null>(null);
  const currentNoteId = useRef<string | null>(isNew ? null : note?.id || null);

  // Platform
  const uiLayout = useNoteEditorLayout(isPreview, setIsPreview);
  const { promptForTag } = useTagPrompt();

  // Logic
  const { toggleCheckboxInContent } = useNoteCheckbox();
  const metrics = useNoteMetrics(content);

  const handleGoBack = useCallback(() => router.back(), [router]);

  // 初期読み込みと外部データ更新の同期
  useEffect(() => {
    if (isNew) {
      if (initializedId.current !== "new") {
        setContent("");
        setTags([]);
        initializedId.current = "new";
      }
    } else if (note && initializedId.current !== note.id) {
      setContent(note.content);
      setTags(note.tags.map((t) => t.name));
      initializedId.current = note.id;
      currentNoteId.current = note.id;
    }
  }, [isNew, note]);

  // 自動保存ロジック
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
          currentNoteId.current = result.id;
          router.setParams({ id: result.id });
          initializedId.current = result.id;
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
  }, [content, tags, isNew, note, isLoading, isDeleting, mutations, router]);

  // Handlers
  const handleCheckboxToggle = useCallback(
    (index: number) => {
      setContent((prev) => toggleCheckboxInContent(prev, index));
    },
    [toggleCheckboxInContent]
  );

  const handleAddTag = useCallback(() => {
    promptForTag(tags, (newTag) => setTags((prev) => [...prev, newTag]));
  }, [promptForTag, tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  }, []);

  const handleTrashAction = async () => {
    const activeId = currentNoteId.current;
    if (!activeId) return;

    setIsDeleting(true);
    try {
      if (note?.deletedAt) {
        await mutations.restoreNote(activeId);
      } else {
        await mutations.deleteNote(activeId);
      }
      uiLayout.infoSheetRef.current?.dismiss();
      setTimeout(handleGoBack, NAVIGATION_DELAY);
    } catch (error) {
      setIsDeleting(false);
      console.error("Failed to toggle trash:", error);
    }
  };

  const handlePermanentDelete = async () => {
    const activeId = currentNoteId.current;
    if (!activeId) return;

    setIsDeleting(true);
    try {
      await mutations.permanentDelete(activeId);
      uiLayout.infoSheetRef.current?.dismiss();
      setTimeout(handleGoBack, NAVIGATION_DELAY);
    } catch (error) {
      setIsDeleting(false);
      console.error("Failed to permanently delete note:", error);
    }
  };

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
 * サイドドロワー内でのログアウト等の操作を制御するフック。
 */
export function useNoteDrawerController(onClose: () => void) {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const logoutMutation = useLogout({
    onSuccess: () => {
      onClose();
      clearAuth();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return {
    handleLogout,
  };
}
