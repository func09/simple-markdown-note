import { useCallback, useRef, useState } from "react";
import { Animated } from "react-native";
import { DRAWER_WIDTH } from "../components/NoteDrawer";

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

const DRAWER_ANIM_DURATION = 300;

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
