import { useCallback, useRef, useState } from "react";
import { Alert, Animated, Platform } from "react-native";
import { DRAWER_ANIM_DURATION, DRAWER_WIDTH } from "../constants";

/**
 * 状態フック (State Hooks)
 *
 * ローカルUIの状態を管理するフック群。
 * `useState` / `useReducer` / `useMemo` を主体とし、
 * `useEffect` が含まれる場合も状態管理の補助に留まる。
 * サーバーデータの取得・同期は含まない。
 *
 * 命名規則:
 *   use[名詞]State      - 汎用的な状態の塊        例: useEditorState, useDrawerState
 *   use[名詞]Form       - フォーム入力の状態       例: useLoginForm, useNoteForm
 *   use[名詞]Filter     - 絞り込み条件の状態       例: useNotesFilter
 *   use[名詞]Selection  - 選択状態の管理           例: useNoteSelection
 */

/**
 * Animated APIを利用したドロワーの開閉スライドアニメーションを制御します。
 */
export function useDrawerState() {
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
export function useTagPrompt() {
  const promptForTag = useCallback(
    (currentTags: string[], onAdd: (tag: string) => void) => {
      if (Platform.OS === "ios") {
        Alert.prompt("Add Tag", "Enter a name for the new tag", (text) => {
          if (text.trim() && !currentTags.includes(text.trim())) {
            onAdd(text.trim());
          }
        });
      } else {
        // TODO: Android用のタグ入力ダイアログを実装する（Alert.prompt はiOS専用のため）
        Alert.alert("Pending", "Tag input for Android is currently pending.");
      }
    },
    []
  );

  return { promptForTag };
}
