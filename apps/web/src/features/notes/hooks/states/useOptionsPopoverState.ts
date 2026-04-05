import { useEffect, useRef, useState } from "react";

/**
 * オプションポップオーバーの表示状態を管理するHook
 */
export function useOptionsPopoverState() {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setIsOptionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return {
    isOptionsOpen,
    setIsOptionsOpen,
    optionsRef,
  };
}
