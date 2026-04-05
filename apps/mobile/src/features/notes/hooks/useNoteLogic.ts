import type { Note } from "@simple-markdown-note/common/schemas";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * ノート要素からタイトル抽出やサマリーの生成、日付のフォーマット処理を行うロジックフック。
 */
export function useNoteListItem(item: Note) {
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
 * ノート編集画面のローカルstate管理と、サーバーデータとの初期化同期を担うロジックフック。
 * UIやAPIに依存せず、state/refの定義と初期化の関心をControllerから分離します。
 */
export function useNoteEditorState(note: Note | undefined, isNew: boolean) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentNoteId = useRef<string | null>(
    isNew ? null : (note?.id ?? null)
  );
  const initializedId = useRef<string | null>(null);

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

  // 新規作成時にサーバーからIDが確定した後、auto-saveから呼ぶことでrefを安全に同期する
  const markAsInitialized = useCallback((id: string) => {
    initializedId.current = id;
    currentNoteId.current = id;
  }, []);

  return {
    content,
    setContent,
    tags,
    setTags,
    isPreview,
    setIsPreview,
    isDeleting,
    setIsDeleting,
    currentNoteId,
    markAsInitialized,
  };
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
