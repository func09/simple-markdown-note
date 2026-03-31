import type React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/common/Dialog";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isTrashSelected: boolean;
  onConfirm: () => void;
}

/**
 * ノート削除時の確誋用モーダルダイアログ
 * 通常のゴミ箱移動と、ゴミ箱からの完全削除で表示文言およびアクションを切り替えます。
 */
export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onOpenChange,
  isTrashSelected,
  onConfirm,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-slate-800 bg-slate-900 text-slate-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            {isTrashSelected ? "Delete Permanently?" : "Delete Note?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {isTrashSelected
              ? "This action is final and cannot be undone."
              : "This note will be moved to the trash."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-500"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

DeleteConfirmModal.displayName = "DeleteConfirmModal";
