import { useCallback } from "react";
import { Alert, Platform } from "react-native";

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
