import React, { useState, useEffect, useRef } from 'react';
import type { Note } from 'openapi';

interface EditorProps {
  note: Note | null;
  onUpdateNote: (id: string, content: string, title: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ note, onUpdateNote }) => {
  const [content, setContent] = useState('');
  const timeoutRef = useRef<any>(null);

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
    const newTitle = lines[0].substring(0, 50); // First line as title

    setContent(newContent);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (note) {
      timeoutRef.current = setTimeout(() => {
        onUpdateNote(note.id, newContent, newTitle);
      }, 1000); // Auto-save after 1 second
    }
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0f172a] text-slate-500">
        <p className="text-lg font-outfit">Select a note to start editing</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0f172a] h-screen overflow-hidden">
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Type your note here..."
        className="flex-1 w-full bg-transparent border-none focus:ring-0 p-8 text-slate-200 text-lg resize-none font-inter placeholder:text-slate-700 custom-scrollbar"
        autoFocus
      />
      <div className="p-4 border-t border-slate-800 text-slate-500 text-xs flex justify-between">
        <span>Chars: {content.length}</span>
        <span>Last updated: {new Date(note.updatedAt).toLocaleString()}</span>
      </div>
    </div>
  );
};
