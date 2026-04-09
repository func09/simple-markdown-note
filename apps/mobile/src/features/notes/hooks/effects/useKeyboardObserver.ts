import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, type TextInput } from "react-native";
import { FOCUS_DELAY } from "../../constants";

/**
 * ノート編集画面におけるキーボードの表示状態や入力フォーカスなど、OS/プラットフォーム固有の挙動を管理します。
 */
export function useKeyboardObserver(
  isPreview: boolean,
  setIsPreview: (val: boolean) => void
) {
  "use memo";
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
