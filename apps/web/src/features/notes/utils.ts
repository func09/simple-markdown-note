/**
 * 表示用に日付をフォーマットする
 */
export function formatDate(dateInput?: string | Date | null) {
  if (!dateInput) return "N/A";
  const date = new Date(dateInput);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 1000 * 60 * 60 * 24) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

/**
 * HTMLの特殊文字をエスケープする
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
