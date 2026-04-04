import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  useCreateNote,
  useDeleteNote,
  useLogout,
  useNotes,
  usePermanentDelete,
  useRestoreNote,
  useTags,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import type { Note } from "@simple-markdown-note/common/schemas";
import { NOTE_SCOPE, type NoteScope } from "@simple-markdown-note/common/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Keyboard,
  Platform,
  type TextInput,
} from "react-native";
import { useAuthStore } from "../auth/store";
import { DRAWER_WIDTH } from "./components/NoteDrawer";

// Constants for magic numbers
const AUTO_SAVE_DELAY = 1000;
const DRAWER_ANIM_DURATION = 300;
const NAVIGATION_DELAY = 250;
const FOCUS_DELAY = 50;

/**
 * 1. ノートの編集状態を管理する Hook
 */
export function useNoteEditorState(isNew: boolean, note?: Note) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const initializedId = useRef<string | null>(null);
  const currentNoteId = useRef<string | null>(isNew ? null : note?.id || null);

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

  const handleCheckboxToggle = useCallback((index: number) => {
    setContent((prev) => {
      const regex = /^(\s*[-*+]\s+)\[([ x])\]/gim;
      let count = 0;
      return prev.replace(regex, (match, prefix, state: string) => {
        if (count++ === index) {
          return `${prefix}[${state.toLowerCase() === "x" ? " " : "x"}]`;
        }
        return match;
      });
    });
  }, []);

  const handleAddTag = useCallback((currentTags: string[]) => {
    if (Platform.OS === "ios") {
      Alert.prompt("Add Tag", "Enter a name for the new tag", (text) => {
        if (text.trim() && !currentTags.includes(text.trim())) {
          setTags([...currentTags, text.trim()]);
        }
      });
    } else {
      Alert.alert("Pending", "Tag input for Android is currently pending.");
    }
  }, []);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  }, []);

  return {
    content,
    setContent,
    tags,
    setTags,
    currentNoteId,
    initializedId,
    handleCheckboxToggle,
    handleAddTag,
    handleRemoveTag,
  };
}

/**
 * 2. ノートの計算値を管理する Hook
 */
export function useNoteMetrics(content: string) {
  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const charCount = useMemo(() => content.length, [content]);

  return { wordCount, charCount };
}

/**
 * 3. 画面のUI状態と挙動を管理する Hook
 */
export function useNoteUIController() {
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const infoSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleKeyboardToggle = useCallback(() => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
    } else {
      if (isPreview) setIsPreview(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, FOCUS_DELAY);
    }
  }, [isKeyboardVisible, isPreview]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    isPreview,
    setIsPreview,
    isKeyboardVisible,
    inputRef,
    infoSheetRef,
    handleKeyboardToggle,
    handleGoBack,
  };
}

/**
 * 4. ノートのデータ操作（API連携・保存）を管理する Hook
 */
export function useNoteOperations({
  isNew,
  content,
  tags,
  currentNoteId,
  initializedId,
  infoSheetRef,
  handleGoBack,
  note,
  isLoading,
}: {
  isNew: boolean;
  content: string;
  tags: string[];
  currentNoteId: React.MutableRefObject<string | null>;
  initializedId: React.MutableRefObject<string | null>;
  infoSheetRef: React.RefObject<BottomSheetModal | null>;
  handleGoBack: () => void;
  note?: Note;
  isLoading: boolean;
}) {
  const router = useRouter();
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const restoreNoteMutation = useRestoreNote();
  const permanentDeleteMutation = usePermanentDelete();

  const [isDeleting, setIsDeleting] = useState(false);

  // 自動保存ロジック
  useEffect(() => {
    if (isLoading || isDeleting) return;
    if (!content.trim() && isNew) return;

    const timer = setTimeout(async () => {
      const activeId = currentNoteId.current;

      if (isNew && !activeId) {
        try {
          const result = await createNoteMutation.mutateAsync({
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
          updateNoteMutation.mutate({
            id: activeId,
            data: { content, tags },
          });
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
    createNoteMutation,
    updateNoteMutation,
    router,
    currentNoteId,
    initializedId,
  ]);

  const handleTrashAction = async () => {
    const activeId = currentNoteId.current;
    if (!activeId) return;

    setIsDeleting(true);
    try {
      if (note?.deletedAt) {
        await restoreNoteMutation.mutateAsync(activeId);
      } else {
        await deleteNoteMutation.mutateAsync(activeId);
      }
      infoSheetRef.current?.dismiss();
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
      await permanentDeleteMutation.mutateAsync(activeId);
      infoSheetRef.current?.dismiss();
      setTimeout(handleGoBack, NAVIGATION_DELAY);
    } catch (error) {
      setIsDeleting(false);
      console.error("Failed to permanently delete note:", error);
    }
  };

  return {
    handleTrashAction,
    handlePermanentDelete,
  };
}

/**
 * NotesIndexScreen 用の Hook
 */
export function useNotesIndex() {
  const router = useRouter();
  const { scope = NOTE_SCOPE.ALL, tag } = useLocalSearchParams<{
    scope?: string;
    tag?: string;
  }>();

  const {
    data: notes = [],
    isLoading: isNotesLoading,
    refetch: refetchNotes,
  } = useNotes({
    scope: scope as NoteScope,
    tag,
  });
  const { data: apiTags = [] } = useTags();
  const tags = apiTags.map((t) => t.name);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const toggleDrawer = (open: boolean) => {
    if (open) setIsDrawerOpen(true);
    Animated.timing(slideAnim, {
      toValue: open ? 0 : -DRAWER_WIDTH,
      duration: DRAWER_ANIM_DURATION,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!open && finished) {
        setIsDrawerOpen(false);
      }
    });
  };

  const filteredNotes = notes.filter((note) => {
    return note.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getHeaderTitle = () => {
    if (tag) return tag;
    if (scope === NOTE_SCOPE.TRASH) return "Trash";
    if (scope === NOTE_SCOPE.UNTAGGED) return "Untagged";
    return "All Notes";
  };

  const handleSelectScope = (newScope: string) => {
    toggleDrawer(false);
    router.setParams({ scope: newScope, tag: undefined });
  };

  const handleSelectTag = (newTag: string) => {
    toggleDrawer(false);
    router.setParams({ tag: newTag, scope: undefined });
  };

  const handleNewNote = () => {
    router.push("/(main)/notes/new");
  };

  const handleSelectNote = (id: string) => {
    router.push(`/(main)/notes/${id}`);
  };

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
 * NoteDrawer 用の Hook
 */
export function useNoteDrawer(onClose: () => void) {
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

/**
 * NoteListItem 用の Hook (タイトル・サマリー抽出)
 */
export function useNoteItem(item: Note) {
  const { title, summary, formattedDate } = useMemo(() => {
    const lines = item.content.trim().split("\n");
    const t = lines[0] || "New Note";
    const s =
      lines.slice(1).join(" ").trim() ||
      (item.content.length > t.length
        ? item.content.slice(t.length).trim()
        : "No additional content");

    const date = new Date(item.updatedAt);
    const fd = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    return { title: t, summary: s, formattedDate: fd };
  }, [item.content, item.updatedAt]);

  return {
    title,
    summary,
    formattedDate,
  };
}
