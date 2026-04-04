import type { ASTNode } from "react-native-markdown-display";

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
