import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Keyboard,
  Platform,
  type TextInput,
} from "react-native";
import { DRAWER_WIDTH } from "../components/NoteDrawer";

const DRAWER_ANIM_DURATION = 300;
const FOCUS_DELAY = 50;

/**
 * ノート編集画面におけるキーボードの表示状態や入力フォーカスなど、OS/プラットフォーム固有の挙動を管理します。
 */
export function useNoteEditorUI(
  isPreview: boolean,
  setIsPreview: (val: boolean) => void
) {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const infoSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () =>
      setIsKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () =>
      setIsKeyboardVisible(false)
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleKeyboardToggle = useCallback(() => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
    } else {
      if (isPreview) setIsPreview(false);
      setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY);
    }
  }, [isKeyboardVisible, isPreview, setIsPreview]);

  return { isKeyboardVisible, inputRef, infoSheetRef, handleKeyboardToggle };
}

/**
 * Animated APIを利用したドロワーの開閉スライドアニメーションを制御します。
 */
export function useNoteDrawer() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const toggleDrawer = useCallback(
    (open: boolean) => {
      if (open) setIsDrawerOpen(true);
      Animated.timing(slideAnim, {
        toValue: open ? 0 : -DRAWER_WIDTH,
        duration: DRAWER_ANIM_DURATION,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!open && finished) {
          setIsDrawerOpen(false);
        }
      });
    },
    [slideAnim]
  );

  return { isDrawerOpen, slideAnim, toggleDrawer };
}

/**
 * iOS/Androidごとのタグ追加用プロンプト・ダイアログの表示を制御します。
 */
export function useNoteTagPrompt() {
  const promptForTag = useCallback(
    (currentTags: string[], onAdd: (tag: string) => void) => {
      if (Platform.OS === "ios") {
        Alert.prompt("Add Tag", "Enter a name for the new tag", (text) => {
          if (text.trim() && !currentTags.includes(text.trim())) {
            onAdd(text.trim());
          }
        });
      } else {
        Alert.alert("Pending", "Tag input for Android is currently pending.");
      }
    },
    []
  );

  return { promptForTag };
}
