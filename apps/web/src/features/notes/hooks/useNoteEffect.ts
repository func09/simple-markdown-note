import { useUpdateNote } from "@simple-markdown-note/api-client/hooks";
import { useCallback, useEffect, useRef } from "react";

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
 * ノートのオートセーブロジックを管理するHook
 */
export function useNoteAutoSave({
  noteId,
  noteContent,
  isDeleting,
  contentRef,
  lastNoteIdRef,
}: {
  noteId?: string;
  noteContent?: string;
  isDeleting: boolean;
  contentRef: React.MutableRefObject<string>;
  lastNoteIdRef: React.MutableRefObject<string | null>;
}) {
  const updateNoteMutation = useUpdateNote();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // mutation関数をrefで保持することで、依存配列に含めずに最新の関数を呼び出せるようにする
  const mutationRef = useRef(updateNoteMutation);
  mutationRef.current = updateNoteMutation;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        const content = contentRef.current;
        const currentNoteContent =
          lastNoteIdRef.current === noteId ? noteContent : undefined;

        if (
          isDeleting ||
          !content.trim() ||
          !noteId ||
          content === currentNoteContent
        )
          return;

        mutationRef.current.mutate({ id: noteId, data: { content } });
      }
    };
  }, [noteId, noteContent, isDeleting, contentRef, lastNoteIdRef]);

  const handleAutoSave = useCallback(
    (content: string) => {
      contentRef.current = content;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (isDeleting || !noteId || content === noteContent) return;

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        mutationRef.current.mutate({ id: noteId, data: { content } });
      }, 10000);
    },
    [noteId, noteContent, isDeleting, contentRef]
  );

  return { handleAutoSave };
}
