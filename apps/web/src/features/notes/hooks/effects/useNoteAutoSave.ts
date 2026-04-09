import { useUpdateNote } from "@simple-markdown-note/api-client/hooks";
import { useCallback, useEffect, useRef } from "react";

/**
 * ノートのオートセーブロジックを管理するHook
 */
export function useNoteAutoSave({
  noteId,
  noteContent,
  isDeleting,
  draftSync,
}: {
  noteId?: string;
  noteContent?: string;
  isDeleting: boolean;
  draftSync: {
    getContent: () => string;
    setContent: (value: string) => void;
    getLastNoteId: () => string | null;
  };
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
        const content = draftSync.getContent();
        const currentNoteContent =
          draftSync.getLastNoteId() === noteId ? noteContent : undefined;

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
  }, [noteId, noteContent, isDeleting, draftSync]);

  const handleAutoSave = useCallback(
    (content: string) => {
      draftSync.setContent(content);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (isDeleting || !noteId || content === noteContent) return;

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        mutationRef.current.mutate({ id: noteId, data: { content } });
      }, 10000);
    },
    [noteId, noteContent, isDeleting, draftSync]
  );

  return { handleAutoSave };
}
