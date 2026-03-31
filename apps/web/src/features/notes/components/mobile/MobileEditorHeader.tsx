import { ArrowLeft, RotateCw, Trash2 } from "lucide-react";
import type React from "react";
import { Button } from "../../../../components/common/Button";

interface MobileEditorHeaderProps {
  selectedNoteId: string | null;
  isTrashSelected: boolean;
  onBack: () => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * モバイル用エディタ上部のヘッダーバー
 * リスト画面へ戻るボタンや、ノートの削除・復元アクションを提供します。
 */
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
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="mr-2 text-slate-400"
        >
          <ArrowLeft size={20} />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {selectedNoteId &&
          (isTrashSelected ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRestore(selectedNoteId)}
                className="text-blue-400 hover:bg-blue-400/10 hover:text-blue-300"
                title="Restore"
              >
                <RotateCw size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(selectedNoteId)}
                className="text-red-400 hover:bg-red-400/10 hover:text-red-300"
                title="Delete Permanently"
              >
                <Trash2 size={20} />
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
              <Trash2 size={20} />
            </Button>
          ))}
      </div>
    </div>
  );
};

MobileEditorHeader.displayName = "MobileEditorHeader";
