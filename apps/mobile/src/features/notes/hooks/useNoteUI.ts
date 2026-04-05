import { useCallback, useRef, useState } from "react";
import { Alert, Animated, Platform } from "react-native";
import { DRAWER_WIDTH } from "../components/NoteDrawer";

const DRAWER_ANIM_DURATION = 300;

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
