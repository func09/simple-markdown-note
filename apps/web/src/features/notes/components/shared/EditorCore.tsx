import React, { useState, useEffect, useRef } from 'react';

import { Clock, Info } from 'lucide-react';
import type { Note } from 'openapi';

import { Textarea } from '@/components/ui/textarea';

import { TagInput } from '@/features/notes/components/shared/TagInput';
import { useUpdateNote } from '@/features/notes/hooks/useNotesQuery';

import { cn } from '@/lib/utils';


interface EditorCoreProps {
  note: Note | null;
  onUpdateTags?: (noteId: string, tags: string[]) => void;
  onRestore?: (id: string) => void;
}

/**
 * ノート編集コアコンポーネント
 * ヘッダーを含まず、タイトル・本文・タグの編集のみを行う
 */
export const EditorCore: React.FC<EditorCoreProps> = ({ note, onUpdateTags, onRestore }) => {
  const [content, setContent] = useState(note?.content || '');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateNoteMutation = useUpdateNote();

  
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // タイトルの高さを自動調整
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
  }, [content, note?.id]);

  const lines = content.split('\n');
  const title = lines[0] || '';
  const body = lines.slice(1).join('\n');

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value;
    const newContent = [newTitle, ...lines.slice(1)].join('\n');
    updateLocalContent(newContent);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateLocalContent(title + '\n' + e.target.value);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      const cursorPosition = e.currentTarget.selectionStart;
      const beforeCursor = title.substring(0, cursorPosition);
      const afterCursor = title.substring(cursorPosition);
      
      const newContent = beforeCursor + '\n' + afterCursor + (body ? '\n' + body : '');
      updateLocalContent(newContent);
      
      setTimeout(() => {
        bodyRef.current?.focus({ preventScroll: true });
        bodyRef.current?.setSelectionRange(0, 0);
      }, 0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      bodyRef.current?.focus();
      bodyRef.current?.setSelectionRange(0, 0);
    }
  };

  const handleBodyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'ArrowUp') {
      const { selectionStart } = e.currentTarget;
      if (selectionStart === 0) {
        e.preventDefault();
        titleRef.current?.focus();
        const titleLen = titleRef.current?.value.length || 0;
        titleRef.current?.setSelectionRange(titleLen, titleLen);
      }
    }
  };

  const updateLocalContent = (newContent: string) => {
    setContent(newContent);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (note) {
      timeoutRef.current = setTimeout(() => {
        updateNoteMutation.mutate({ 
          id: note.id, 
          data: { content: newContent } 
        });
      }, 1000);
    }
  };

  const handleTagsChange = (newTags: string[]) => {
    if (note && onUpdateTags) {
      onUpdateTags(note.id, newTags);
    }
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0f172a] text-slate-600">
        <div className="text-center">
          <p className="text-xl font-outfit mb-2">No note selected</p>
          <p className="text-sm">Select a note from the list to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0f172a] h-full overflow-hidden">
      {/* Restore Banner */}
      {note.deletedAt && (
        <div className="bg-blue-600/20 border-b border-blue-500/30 px-6 py-2 flex items-center justify-between text-blue-400 text-xs font-medium">
          <div className="flex items-center gap-2">
            <Info size={14} />
            <span>このノートはゴミ箱の中にあります。編集するには復元してください。</span>
          </div>
          <button 
            onClick={() => onRestore?.(note.id)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md transition-colors"
          >
            復元する
          </button>
        </div>
      )}

      <div className="flex-1 w-full overflow-y-auto bg-[#0f172a] custom-scrollbar flex flex-col">
        <div className="flex-1 w-full px-8 md:px-16 py-8 pb-32 flex flex-col min-h-full">
          {/* Title Area */}
          <div className="mb-1 w-full flex-shrink-0">
            <textarea
              ref={titleRef}
              id="editor-title"
              rows={1}
              value={title}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleTitleChange(e)}
              onKeyDown={handleTitleKeyDown}
              placeholder="Title"
              disabled={!!note.deletedAt}
              className={cn(
                "w-full bg-transparent border-none focus:ring-0 p-0 text-slate-100 font-bold tracking-tight outline-none placeholder:text-slate-800",
                "text-lg md:text-lg lg:text-lg leading-tight resize-none overflow-hidden whitespace-pre-wrap break-words",
                "transition-all duration-300",
                note.deletedAt && "opacity-60 cursor-not-allowed"
              )}
              style={{ height: 'auto' }}
            />
          </div>

          {/* Body Area */}
          <Textarea
            ref={bodyRef}
            value={body}
            onChange={handleBodyChange}
            onKeyDown={handleBodyKeyDown}
            placeholder="Start writing..."
            disabled={!!note.deletedAt}
            className={cn(
              "w-full flex-1 bg-transparent border-none focus-visible:ring-0 p-0 text-slate-400 text-sm md:text-sm lg:text-sm leading-relaxed resize-none font-inter placeholder:text-slate-800 shadow-none border-0 min-h-[calc(100vh-150px)] [field-sizing:content!important] overflow-hidden",
              note.deletedAt && "opacity-60 cursor-not-allowed"
            )}
          />
        </div>
      </div>
      
      {/* タグ入力エリア */}
      <div className={cn(
        "px-8 md:px-12 py-2 bg-[#0f172a]/80 backdrop-blur-md border-t border-slate-800/30",
        note.deletedAt && "pointer-events-none opacity-40"
      )}>
        <TagInput 
          tags={note.tags?.map(t => t.name) || []} 
          onChange={handleTagsChange} 
        />
      </div>

      {/* Status Bar */}
      <div className="px-6 py-2 bg-[#0f172a] text-slate-600 text-[10px] uppercase tracking-wider font-medium flex justify-between items-center border-t border-slate-800/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Info size={10} className="text-slate-700" />
            <span>{content.length} characters</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={10} className="text-slate-700" />
            <span>
              {updateNoteMutation.isPending ? 'Syncing...' : `Saved ${new Date(note.updatedAt).toLocaleTimeString()}`}
            </span>
          </div>
        </div>
        <div className="text-slate-800 font-outfit font-bold">SN CLONE</div>
      </div>
    </div>
  );
};
