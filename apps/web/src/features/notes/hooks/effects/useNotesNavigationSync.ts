import type { NoteScope } from "@simple-markdown-note/schemas";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useNotesStore } from "@/features/notes/store";

/**
 * URLパラメータとPropsの状態をNotesストアに同期するHook
 */
export function useNotesNavigationSync(propSelectedNoteId?: string) {
  "use memo";
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
