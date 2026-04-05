import { useEffect, useRef, useState } from "react";

/**
 * 情報ポップオーバーの表示状態を管理するHook
 */
export function useInfoPopoverState() {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setIsInfoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return {
    isInfoOpen,
    setIsInfoOpen,
    infoRef,
  };
}
