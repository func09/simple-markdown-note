import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import type {
  useCreateNote,
  useNote,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import type { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, type TextInput } from "react-native";
import { AUTO_SAVE_DELAY, FOCUS_DELAY } from "../constants";

/**
 * 副作用フック (Effect Hooks)
 *
 * 外部システムとの同期や継続的な監視を担うフック群。
 * `useEffect` が主役であり、返り値を持たないか、副作用を制御するハンドラのみを返す。
 * 状態管理の主体にはならない。
 *
 * 命名規則:
 *   use[名詞]Sync       - 外部状態との同期          例: useNotesNavigationSync, useAuthSync
 *   use[名詞]Observer   - 環境・デバイス状態の監視  例: useKeyboardObserver, useNetworkObserver
 *   use[名詞]Listener   - イベントの購読            例: useAppStateListener
 *   useAuto[名詞]       - 自動実行される処理        例: useAutoSave, useAutoPrefetch
 */

/**
 * ノート編集画面におけるキーボードの表示状態や入力フォーカスなど、OS/プラットフォーム固有の挙動を管理します。
 */
export function useKeyboardObserver(
  isPreview: boolean,
  setIsPreview: (val: boolean) => void
) {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const infoSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () =>
      setIsKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () =>
      setIsKeyboardVisible(false)
    );
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
      setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY);
    }
  }, [isKeyboardVisible, isPreview, setIsPreview]);

  return { isKeyboardVisible, inputRef, infoSheetRef, handleKeyboardToggle };
}

/**
 * ノート編集画面における自動保存の副作用フック
 */
export function useNoteAutoSave({
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
