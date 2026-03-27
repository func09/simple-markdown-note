import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileEditorHeaderProps {
  selectedNoteId: string | null;
  isTrashSelected: boolean;
  onBack: () => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

export const MobileEditorHeader: React.FC<MobileEditorHeaderProps> = ({
  selectedNoteId,
  isTrashSelected,
  onBack,
  onRestore,
  onDelete,
}) => {
  return (
    <div className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/5 bg-[#0f172a]/80 px-4 backdrop-blur-md">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 text-slate-400">
          <ArrowLeft size={20} />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {selectedNoteId && (
          <>
            {isTrashSelected ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRestore(selectedNoteId)}
                  className="text-blue-400 hover:bg-blue-400/10 hover:text-blue-300"
                  title="Restore"
                >
                  <ArrowLeft className="rotate-180" size={20} />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-rotate-cw"
                  >
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(selectedNoteId)}
                  className="text-red-400 hover:bg-red-400/10 hover:text-red-300"
                  title="Delete Permanently"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-trash-2"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(selectedNoteId)}
                className="text-slate-400 hover:bg-red-400/10 hover:text-red-400"
                title="Move to Trash"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-trash-2"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" x2="10" y1="11" y2="17" />
                  <line x1="14" x2="14" y1="11" y2="17" />
                </svg>
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

MobileEditorHeader.displayName = 'MobileEditorHeader';
