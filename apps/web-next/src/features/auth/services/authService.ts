import { getMe as apiGetMe, signup as apiSignup, signin } from "../api";

/**
 * 認証関連のビジネスロジックを管理するサービス
 */
export const authService = {
  /**
   * ログインを実行します
   */
  async login(data: { email: string; password: string }) {
    try {
      const res = await signin(data);
      return res;
    } catch (error) {
      console.error("Login service error:", error);
      throw error;
    }
  },

  /**
   * 新規登録を実行します
   */
  async signup(data: { email: string; password: string }) {
    try {
      const res = await apiSignup(data);
      return res;
    } catch (error) {
      console.error("Signup service error:", error);
      throw error;
    }
  },

  /**
   * ログアウトを実行
   */
  async logout() {
    try {
      // サーバーサイドのクッキーをクリア
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  /**
   * 現在のログインユーザー情報を取得
   */
  async getMe() {
    try {
      return await apiGetMe();
    } catch (error) {
      // ネットワークエラーなどの予期せぬ例外時のみログを出す
      console.error("getMe unexpected error:", error);
      return null;
    }
  },

  /**
   * 認証済み確認
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await authService.getMe();
    return !!user;
  },
};
