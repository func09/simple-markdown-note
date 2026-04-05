import { useMemo } from "react";
import { useNotesStore } from "@/features/notes/store";

/**
 * 現在のフィルタ状態（scope, tag）に基づいてURLクエリストリングを生成するHook
 */
export function useNotesFilter() {
  const scope = useNotesStore((s) => s.filterScope);
  const tag = useNotesStore((s) => s.filterTag);

  return useMemo(() => {
    const params = new URLSearchParams();
    if (scope !== "all") params.set("scope", scope);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [scope, tag]);
}
