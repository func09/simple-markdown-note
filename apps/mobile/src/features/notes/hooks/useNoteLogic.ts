import type { Note } from "@simple-markdown-note/common/schemas";
import { useCallback, useMemo, useState } from "react";

/**
 * ノートのコンテンツから単語数や文字数などの指標を計算する純粋なロジックフック。
 * UIやAPIに依存せず、高速にテスト可能です。
 */
export function useNoteMetrics(content: string) {
  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const charCount = useMemo(() => content.length, [content]);

  return { wordCount, charCount };
}

/**
 * ノート一覧の検索文字列に基づいたフィルタリングを実行するロジックフック。
 */
export function useNoteFilter(notes: Note[], searchQuery: string) {
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      return note.content.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [notes, searchQuery]);

  return { filteredNotes };
}

/**
 * ノート要素からタイトル抽出やサマリーの生成、日付のフォーマット処理を行うロジックフック。
 */
export function useNoteFormatter(item: Note) {
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

/**
 * Markdownテキストのチェックボックス（`[ ]` と `[x]`）のトグル状態を算出するロジックフック。
 */
export function useNoteCheckbox() {
  const toggleCheckboxInContent = useCallback(
    (content: string, index: number) => {
      const regex = /^(\s*[-*+]\s+)\[([ x])\]/gim;
      let count = 0;
      return content.replace(regex, (match, prefix, state: string) => {
        if (count++ === index) {
          return `${prefix}[${state.toLowerCase() === "x" ? " " : "x"}]`;
        }
        return match;
      });
    },
    []
  );

  return { toggleCheckboxInContent };
}
