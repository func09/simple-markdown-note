/**
 * クッキーに「ログイン済みの旗」があるかを確認する
 * JSから参照可能な is_logged_in クッキーのみを見るため同期的に判定可能
 */
export const isAuthenticated = (): boolean => {
  if (typeof document === "undefined") return false;
  // document.cookie から特定の文字列を探す
  return document.cookie
    .split(";")
    .some((item) => item.trim().startsWith("is_logged_in=true"));
};
