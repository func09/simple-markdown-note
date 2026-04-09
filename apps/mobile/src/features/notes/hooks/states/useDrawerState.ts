import { useRef, useState } from "react";
import { Animated } from "react-native";
import { DRAWER_ANIM_DURATION, DRAWER_WIDTH } from "../../constants";

/**
 * Animated APIを利用したドロワーの開閉スライドアニメーションを制御します。
 */
export function useDrawerState() {
  "use memo";
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const toggleDrawer = (open: boolean) => {
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
  };

  return { isDrawerOpen, slideAnim, toggleDrawer };
}
