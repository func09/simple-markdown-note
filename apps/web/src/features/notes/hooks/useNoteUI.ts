import { useEffect, useRef, useState } from "react";

/**
 * エディタ内のポップオーバー（情報、オプション）の表示管理を行うHook
 */
export function useEditorPopovers() {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setIsInfoOpen(false);
      }
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
    isInfoOpen,
    setIsInfoOpen,
    isOptionsOpen,
    setIsOptionsOpen,
    infoRef,
    optionsRef,
  };
}
