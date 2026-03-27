import React from 'react';

import type { Note } from 'openapi';

import { DesktopEditorHeader } from '@/features/notes/components/desktop/DesktopEditorHeader';
import { EditorCore } from '@/features/notes/components/shared/EditorCore';
import { useNoteStore } from '@/features/notes/store';

interface EditorProps {
  note: Note | null;
  onUpdateTags?: (noteId: string, tags: string[]) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * デスクトップ用エディタコンポーネント (EditorCore のラッパー)
 */
export const DesktopEditor: React.FC<EditorProps> = ({
  note,
  onUpdateTags,
  onRestore,
  onDelete,
}) => {
  const { isTrashSelected } = useNoteStore();

  // 保存中などのグローバルな状態管理が必要な場合はここでフックを使用
  // updateNoteMutation は EditorCore 内で完結している想定

  if (!note) {
    return <EditorCore note={null} />;
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <DesktopEditorHeader
        noteId={note.id}
        isTrashSelected={isTrashSelected}
        onRestore={onRestore}
        onDelete={onDelete}
      />
      <div className="flex-1 overflow-hidden">
        <EditorCore key={note.id} note={note} onUpdateTags={onUpdateTags} onRestore={onRestore} />
      </div>
    </div>
  );
};

DesktopEditor.displayName = 'DesktopEditor';
