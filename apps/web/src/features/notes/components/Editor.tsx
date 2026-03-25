import React, { useState, useEffect, useRef } from 'react';
import type { Note } from 'openapi';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Loader2, Info } from 'lucide-react';
import { useUpdateNote } from '../hooks/useNotesQuery';
import { TagInput } from './TagInput';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    if (note) {
      setContent(note.content || '');
    } else {
      setContent('');
    }
  }, [note?.id]);

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
    const newBody = e.target.value;
    const newContent = title + '\n' + newBody;
    updateLocalContent(newContent);
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
      <ScrollArea className="flex-1 w-full">
        <div className="max-w-4xl mx-auto w-full p-8 md:p-12 pb-32 flex flex-col">
          {/* Title Area */}
          <div className="relative mb-12 group">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Title"
              className={cn(
                "w-full bg-transparent border-none focus:ring-0 p-0 text-slate-100 font-bold tracking-tight outline-none placeholder:text-slate-800",
                "text-4xl md:text-5xl lg:text-6xl",
                "transition-all duration-300",
                // 最初の1文字目を大きく（Drop Cap的スタイル）
                "first-letter:text-blue-500 first-letter:mr-1 first-letter:font-outfit"
              )}
            />
            <div className="absolute -bottom-4 left-0 w-12 h-1 bg-blue-600/30 rounded-full group-focus-within:w-24 group-focus-within:bg-blue-500 transition-all duration-500" />
          </div>

          {/* Body Area */}
          <Textarea
            value={body}
            onChange={handleBodyChange}
            placeholder="Start writing..."
            className="w-full min-h-[500px] bg-transparent border-none focus-visible:ring-0 p-0 text-slate-400 text-lg leading-relaxed resize-none font-inter placeholder:text-slate-800 shadow-none border-0"
          />
        </div>
      </ScrollArea>
      
      {/* タグ入力エリア */}
      <div className="px-8 md:px-12 bg-[#0f172a]/80 backdrop-blur-md">
        <TagInput 
          tags={note.tags?.map(t => t.name) || []} 
          onChange={handleTagsChange} 
        />
      </div>

      <Separator className="bg-slate-800" />
      
      <div className="px-6 py-3 bg-[#0f172a]/80 backdrop-blur-md text-slate-500 text-[11px] uppercase tracking-wider font-medium flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-help">
                <Info size={12} className="text-slate-600" />
                <span>{content.length} characters</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">Total characters in this note</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-help">
                <Clock size={12} className="text-slate-600" />
                <span>
                  {updateNoteMutation.isPending ? (
                    <span className="flex items-center gap-1">
                      <Loader2 size={10} className="animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    `Last saved ${new Date(note.updatedAt).toLocaleTimeString()}`
                  )}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">Sync status with server</TooltipContent>
          </Tooltip>
        </div>
        <div className="text-blue-500/50 font-outfit font-bold">SimpleNote Clone</div>
      </div>
    </div>
  );
};
