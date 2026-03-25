import React, { useState, useEffect, useRef } from 'react';
import type { Note } from 'openapi';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Loader2, Info, Columns3 } from 'lucide-react';
import { useUpdateNote } from '../hooks/useNotesQuery';
import { TagInput } from './TagInput';
import { cn } from '@/lib/utils';
import { useNoteStore } from '../store';

interface EditorProps {
  note: Note | null;
  onUpdateTags?: (noteId: string, tags: string[]) => void;
}

/**
 * ノート編集用コンポーネント (TanStack Query 使用版)
 */
export const Editor: React.FC<EditorProps> = ({ note, onUpdateTags }) => {
  const [content, setContent] = useState('');
  const timeoutRef = useRef<any>(null);
  const updateNoteMutation = useUpdateNote();
  const { toggleLayoutMode } = useNoteStore();

  useEffect(() => {
    if (note) {
      setContent(note.content || '');
    } else {
      setContent('');
    }
  }, [note?.id]);
  
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // タイトルの高さを自動調整する副作用
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
  }, [content, note?.id]);

  // content をタイトル（1行目）と本文（2行目以降）に分割
  const lines = content.split('\n');
  const title = lines[0] || '';
  const body = lines.slice(1).join('\n');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    const newContent = [newTitle, ...lines.slice(1)].join('\n');
    updateLocalContent(newContent);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateLocalContent(title + '\n' + e.target.value);
  };

  // タイトル入力でのキー操作
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      bodyRef.current?.focus();
      // 本文の先頭にカーソルを移動
      bodyRef.current?.setSelectionRange(0, 0);
    } else if (e.key === 'ArrowDown') {
      const { selectionStart, value } = e.currentTarget;
      // 最後の行にいるかチェック（簡易的に最後の文字付近なら次へ）
      if (selectionStart >= value.length) {
        bodyRef.current?.focus();
        bodyRef.current?.setSelectionRange(0, 0);
      }
    }
  };

  // 本文入力でのキー操作
  const handleBodyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'ArrowUp') {
      const { selectionStart } = e.currentTarget;
      if (selectionStart === 0) {
        e.preventDefault();
        titleRef.current?.focus();
        // タイトルの末尾にカーソルを移動
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
    <div className="flex-1 flex flex-col bg-[#0f172a] h-screen overflow-hidden">
      {/* Editor Header */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-slate-800/30 bg-[#0f172a]/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLayoutMode}
            className="p-2 text-slate-500 hover:text-blue-400 transition-colors bg-slate-800/20 rounded-lg"
            title="Toggle Layout"
          >
            <Columns3 size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {updateNoteMutation.isPending && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              <Loader2 size={12} className="animate-spin text-blue-500" />
              <span>Saving</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 w-full overflow-y-auto bg-[#0f172a] custom-scrollbar flex flex-col">
        <div className="flex-1 w-full px-8 md:px-16 py-8 pb-32 flex flex-col min-h-full">
          {/* Title Area */}
          <div className="relative mb-6 group w-full flex-shrink-0">
            <textarea
              ref={titleRef}
              rows={1}
              value={title}
              onChange={(e) => {
                handleTitleChange(e as any);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onKeyDown={handleTitleKeyDown}
              placeholder="Title"
              className={cn(
                "w-full bg-transparent border-none focus:ring-0 p-0 text-slate-100 font-bold tracking-tight outline-none placeholder:text-slate-800",
                "text-lg md:text-lg lg:text-lg leading-tight resize-none overflow-hidden whitespace-pre-wrap break-words",
                "transition-all duration-300"
              )}
              style={{ height: 'auto' }}
            />
            <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-blue-600/20 rounded-full group-focus-within:w-20 group-focus-within:bg-blue-500/50 transition-all duration-500" />
          </div>

          {/* Body Area */}
          <Textarea
            ref={bodyRef as any}
            value={body}
            onChange={handleBodyChange}
            onKeyDown={handleBodyKeyDown}
            placeholder="Start writing..."
            className="w-full flex-1 bg-transparent border-none focus-visible:ring-0 p-0 text-slate-400 text-sm md:text-sm lg:text-sm leading-relaxed resize-none font-inter placeholder:text-slate-800 shadow-none border-0 min-h-[calc(100vh-250px)] [field-sizing:fixed!important]"
          />
        </div>
      </div>
      
      {/* タグ入力エリア */}
      <div className="px-8 md:px-12 py-2 bg-[#0f172a]/80 backdrop-blur-md border-t border-slate-800/30">
        <TagInput 
          tags={note.tags?.map(t => t.name) || []} 
          onChange={handleTagsChange} 
        />
      </div>

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
