import type {
  useCreateNote,
  useNote,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import type { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { AUTO_SAVE_DELAY } from "../../constants";

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
  "use memo";
  // mutations オブジェクトを ref で保持し、依存配列に含めずに最新の mutate を呼び出す
  const mutationsRef = useRef(mutations);
  mutationsRef.current = mutations;

  useEffect(() => {
    if (isLoading || isDeleting) return;
    if (!content.trim() && isNew) return;

    const timer = setTimeout(async () => {
      const activeId = currentNoteId.current;
      const m = mutationsRef.current;

      if (isNew && !activeId) {
        try {
          const result = await m.createNote({
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
          m.updateNote({ id: activeId, data: { content, tags } });
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
    router,
    currentNoteId,
    markAsInitialized,
  ]);
}
