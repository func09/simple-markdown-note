import { useCallback } from "react";

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
