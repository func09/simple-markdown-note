import React, { useState, useEffect, useRef } from 'react';
import type { Note } from 'openapi';
import { Textarea } from '../../../components/ui/textarea';
import { Separator } from '../../../components/ui/separator';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Clock, Hash, Loader2 } from 'lucide-react';
import { useUpdateNote } from '../hooks/useNotesQuery';

interface EditorProps {
  note: Note | null;
}

/**
 * ノート編集用コンポーネント (TanStack Query 使用版)
 */
export const Editor: React.FC<EditorProps> = ({ note }) => {
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
    const lines = newContent.split('\n');
    const newTitle = lines[0].substring(0, 50) || 'Untitled';

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
        <div className="max-w-4xl mx-auto w-full p-8 md:p-12">
          <Textarea
            value={content}
            onChange={handleChange}
            placeholder="Start writing..."
            className="w-full min-h-[calc(100vh-160px)] bg-transparent border-none focus-visible:ring-0 p-0 text-slate-200 text-xl leading-relaxed resize-none font-inter placeholder:text-slate-700 shadow-none border-0"
            autoFocus
          />
        </div>
      </ScrollArea>
      
      <Separator className="bg-slate-800" />
      
      <div className="px-6 py-3 bg-[#0f172a]/80 backdrop-blur-md text-slate-500 text-[11px] uppercase tracking-wider font-medium flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Hash size={12} className="text-slate-600" />
            <span>{content.length} characters</span>
          </div>
          <div className="flex items-center gap-1.5">
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
        </div>
        <div className="text-blue-500/50 font-outfit font-bold">SimpleNote Clone</div>
      </div>
    </div>
  );
};
