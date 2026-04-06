import type { Note } from "@simple-markdown-note/schemas";
import { useMemo } from "react";

/**
 * ノート要素からタイトル抽出やサマリーの生成、日付のフォーマット処理を行うフック。
 */
export function useNoteItemState(item: Note) {
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

  return { title, summary, formattedDate };
}
