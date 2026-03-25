import React, { useState, useEffect, useRef } from 'react';
import type { Note } from 'openapi';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Loader2, Info } from 'lucide-react';
import { useUpdateNote } from '../hooks/useNotesQuery';
import { TagInput } from './TagInput';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
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
        <div className="max-w-4xl mx-auto w-full p-8 md:p-12 pb-32">
          <Textarea
            value={content}
            onChange={handleChange}
            placeholder="Start writing..."
            className="w-full min-h-[calc(100vh-250px)] bg-transparent border-none focus-visible:ring-0 p-0 text-slate-200 text-xl leading-relaxed resize-none font-inter placeholder:text-slate-700 shadow-none border-0"
            autoFocus
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
