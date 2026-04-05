import { useUpdateNote } from "@simple-markdown-note/api-client/hooks";
import type { NoteScope } from "@simple-markdown-note/common/types";
import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useNotesStore } from "../store";

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

/**
 * URLパラメータとPropsの状態をNotesストアに同期するHook
 */
export function useNotesNavigationSync(propSelectedNoteId?: string) {
  const [searchParams] = useSearchParams();
  const setSelectedNoteId = useNotesStore((s) => s.setSelectedNoteId);
  const setFilterScope = useNotesStore((s) => s.setFilterScope);
  const setFilterTag = useNotesStore((s) => s.setFilterTag);

  const urlScope = searchParams.get("scope");
  const urlTag = searchParams.get("tag");

  // 1. URLのクエリパラメータによるフィルタ状態の同期
  // URLの状態（"tag", "scope"など）をZustandのグローバルストアに反映します。
  // ブラウザの戻る/進むやURL直打ちに対応するため、現在の状態と差分がある場合のみ更新を行います。
  useEffect(() => {
    const currentState = useNotesStore.getState();
    if (urlTag && urlTag !== currentState.filterTag) {
      setFilterTag(urlTag);
    } else if (urlScope && urlScope !== currentState.filterScope) {
      setFilterScope(urlScope as NoteScope);
    } else if (!urlTag && !urlScope && currentState.filterScope !== "all") {
      setFilterScope("all");
    }
  }, [urlScope, urlTag, setFilterScope, setFilterTag]);

  // 2. 選択中のノートIDの同期
  // ルーティング等（/notes/:id など）を通じてコンポーネントのPropsとして渡された
  // IDをZustandのストアに反映します。これも不要な更新を防ぐため差分チェックを行います。
  useEffect(() => {
    const targetId = propSelectedNoteId || null;
    if (targetId !== useNotesStore.getState().selectedNoteId) {
      setSelectedNoteId(targetId);
    }
  }, [propSelectedNoteId, setSelectedNoteId]);
}
