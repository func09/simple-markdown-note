import type { Note } from "@simple-markdown-note/common/schemas";
import type { Editor } from "@tiptap/react";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Info,
  MoreVertical,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatDate } from "../utils";

interface EditorHeaderProps {
  note?: Note;
  editor: Editor | null;
  isMobile?: boolean;
  isPreview: boolean;
  setIsPreview: (v: boolean) => void;
  queryString: string;
  isTrashView: boolean;
  isInfoOpen: boolean;
  setIsInfoOpen: (v: boolean) => void;
  isOptionsOpen: boolean;
  setIsOptionsOpen: (v: boolean) => void;
  infoRef: React.RefObject<HTMLDivElement | null>;
  optionsRef: React.RefObject<HTMLDivElement | null>;
  handleDelete: () => void;
  handleRestore: () => void;
  handlePermanentDelete: () => void;
}

export function EditorHeader({
  note,
  editor,
  isMobile,
  isPreview,
  setIsPreview,
  queryString,
  isTrashView,
  isInfoOpen,
  setIsInfoOpen,
  isOptionsOpen,
  setIsOptionsOpen,
  infoRef,
  optionsRef,
  handleDelete,
  handleRestore,
  handlePermanentDelete,
}: EditorHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
      <div className="flex items-center gap-2">
        {isMobile && (
          <button
            type="button"
            onClick={() => navigate(`/notes${queryString}`)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors mr-2"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className={cn(
            "p-2 rounded-full transition-all active:scale-95",
            isPreview
              ? "bg-slate-900 text-white shadow-md shadow-slate-200"
              : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          )}
          title={isPreview ? "Edit Mode" : "Preview Mode"}
        >
          {isPreview ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>

        <div className="relative" ref={infoRef}>
          <button
            type="button"
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            className={cn(
              "p-2 rounded-full transition-all active:scale-95",
              isInfoOpen
                ? "bg-slate-100 text-slate-900"
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            )}
            title="Note Info"
          >
            <Info className="w-5 h-5" />
          </button>

          {isInfoOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 p-5 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Note Information
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight mb-0.5">
                      Characters
                    </p>
                    <p className="text-lg font-semibold text-slate-900 tabular-nums">
                      {editor?.storage.characterCount
                        .characters()
                        .toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight mb-0.5">
                      Words
                    </p>
                    <p className="text-lg font-semibold text-slate-900 tabular-nums">
                      {editor?.storage.characterCount.words().toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 space-y-3">
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight mb-1">
                      Modified
                    </p>
                    <p className="text-xs text-slate-600 font-medium">
                      {formatDate(note?.updatedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight mb-1">
                      Created
                    </p>
                    <p className="text-xs text-slate-600 font-medium">
                      {formatDate(note?.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={optionsRef}>
          <button
            type="button"
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            className={cn(
              "p-2 rounded-full transition-all active:scale-95",
              isOptionsOpen
                ? "bg-slate-100 text-slate-900"
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            )}
            title="Note Options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isOptionsOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
              {isTrashView ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleRestore();
                      setIsOptionsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors group"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handlePermanentDelete();
                      setIsOptionsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
                  >
                    <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-500 transition-colors" />
                    Delete Permanently
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleDelete();
                    setIsOptionsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors group"
                >
                  <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  Move to Trash
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

EditorHeader.displayName = "EditorHeader";
