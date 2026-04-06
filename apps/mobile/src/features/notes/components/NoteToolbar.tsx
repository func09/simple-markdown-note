import {
  ChevronLeft,
  Eye,
  EyeOff,
  Info,
  Keyboard as KeyboardIcon,
  SquarePen,
} from "lucide-react-native";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";

interface NoteToolbarProps {
  isPreview: boolean;
  setIsPreview: (val: boolean) => void;
  isKeyboardVisible: boolean;
  onGoBack: () => void;
  onOpenInfo: () => void;
  onToggleKeyboard: () => void;
}
/**
 * ノート編集・詳細画面上部に表示されるツールバーコンポーネント。
 * 戻るボタンやプレビューの切り替え、ソフトウェアキーボードのトグル、設定および詳細情報シートの表示アクションを提供します。
 */
export function NoteToolbar({
  isPreview,
  setIsPreview,
  isKeyboardVisible,
  onGoBack,
  onOpenInfo,
  onToggleKeyboard,
}: NoteToolbarProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-2 border-b border-slate-100 bg-white z-10">
      <TouchableOpacity
        onPress={onGoBack}
        className="flex-row items-center p-2 -ml-2"
      >
        <ChevronLeft size={24} color="#0f172a" />
        <Text className="text-slate-900 font-medium ml-1">Back</Text>
      </TouchableOpacity>

      <View className="flex-row items-center space-x-2">
        <TouchableOpacity
          onPress={() => setIsPreview(!isPreview)}
          className="p-2"
          activeOpacity={0.7}
        >
          {isPreview ? (
            <EyeOff size={22} color="#475569" />
          ) : (
            <Eye size={22} color="#475569" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Keyboard.dismiss();
            onOpenInfo();
          }}
          className="p-2 ml-1"
        >
          <Info size={22} color="#475569" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onToggleKeyboard} className="p-2 -mr-1">
          {isKeyboardVisible ? (
            <KeyboardIcon size={22} color="#3b82f6" />
          ) : (
            <SquarePen size={22} color="#475569" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
