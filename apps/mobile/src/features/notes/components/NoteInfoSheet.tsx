import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Trash2, X } from "lucide-react-native";
import type { RefObject } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { formatDate } from "../utils";

interface NoteInfoSheetProps {
  sheetRef: RefObject<BottomSheetModal | null>;
  note:
    | { id: string; updatedAt: string; deletedAt?: string | null }
    | undefined
    | null;
  metrics: { wordCount: number; charCount: number };
  onTrashAction: () => void;
  onPermanentDelete: () => void;
}
/**
 * ノートの詳細情報や操作アクションを提供するボトムシートコンポーネント。
 * 文字数・更新日時の確認、ノートの削除およびゴミ箱からの復元などのメニューを表示します。
 */
export function NoteInfoSheet({
  sheetRef,
  note,
  metrics,
  onTrashAction,
  onPermanentDelete,
}: NoteInfoSheetProps) {
  "use memo";
  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.2}
    />
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView>
        <View className="border-t border-slate-100">
          {note && (
            <>
              <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
                <Text className="text-base text-slate-800">Updated at</Text>
                <Text className="text-base text-slate-400">
                  {formatDate(note.updatedAt)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
                <Text className="text-base text-slate-800">Note ID</Text>
                <Text
                  className="text-base text-slate-400 truncate ml-4"
                  numberOfLines={1}
                >
                  {note.id}
                </Text>
              </View>
            </>
          )}
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
            <Text className="text-base text-slate-800">Words</Text>
            <Text className="text-base text-slate-400">
              {metrics.wordCount}
            </Text>
          </View>
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
            <Text className="text-base text-slate-800">Characters</Text>
            <Text className="text-base text-slate-400">
              {metrics.charCount}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <TouchableOpacity
            className="flex-row items-center px-5 py-4 border-b border-slate-50"
            onPress={onTrashAction}
          >
            <Trash2 size={20} color={note?.deletedAt ? "#3b82f6" : "#ef4444"} />
            <Text
              className={`text-base ml-3 ${note?.deletedAt ? "text-blue-500" : "text-red-500"}`}
            >
              {note?.deletedAt ? "Restore from Trash" : "Move to Trash"}
            </Text>
          </TouchableOpacity>

          {note?.deletedAt && (
            <TouchableOpacity
              className="flex-row items-center px-5 py-4"
              onPress={onPermanentDelete}
            >
              <X size={20} color="#ef4444" />
              <Text className="text-base text-red-500 ml-3">
                Permanently Delete
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
