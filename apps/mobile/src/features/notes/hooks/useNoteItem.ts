import type { Note } from "@simple-markdown-note/common/schemas";
import { useMemo } from "react";

/**
 * ノートリストのそれぞれの一覧要素に対して、本文からのタイトル抽出やサマリーの生成、
 * および日付のフォーマット処理を行うカスタムフックです。リスト描画に必要な最適なデータを提供します。
 *
 * @param item 計算対象となる単一のノートデータを指定します。
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
