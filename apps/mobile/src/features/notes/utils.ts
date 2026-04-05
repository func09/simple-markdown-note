import type { ASTNode } from "react-native-markdown-display";
import { NAVIGATION_DELAY } from "./constants";

export function getNodeText(node: ASTNode): string {
  if (node.content) {
    return node.content;
  }
  if (node.children && node.children.length > 0) {
    return node.children.map(getNodeText).join("");
  }
  return "";
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export async function executeNoteDelete(
  action: () => Promise<unknown>,
  label: string,
  context: {
    setIsDeleting: (v: boolean) => void;
    infoSheetRef: { current: { dismiss(): void } | null };
    handleGoBack: () => void;
  }
) {
  context.setIsDeleting(true);
  try {
    await action();
    context.infoSheetRef.current?.dismiss();
    setTimeout(context.handleGoBack, NAVIGATION_DELAY);
  } catch (error) {
    context.setIsDeleting(false);
    console.error(`Failed to ${label}:`, error);
  }
}
