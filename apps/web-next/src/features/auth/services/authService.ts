import { signin, signup as apiSignup } from "../api";

/**
 * 認証関連のビジネスロジックを管理するサービス
 */
export const authService = {
  /**
   * ログインを実行し、トークンを保存します
   */
  async login(data: { email: string; password: string }) {
    const res = await signin(data);
    this.setToken(res.token);
    return res;
  },

  /**
   * 新規登録を実行します
   */
  async signup(data: { email: string; password: string }) {
    return await apiSignup(data);
  },

  /**
   * ログアウトを実行し、トークンを削除します
   */
  logout() {
    this.removeToken();
  },

  /**
   * トークンを取得します
   */
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  },

  /**
   * トークンを保存します
   */
  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("token", token);
  },

  /**
   * トークンを削除します
   */
  removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
  },

  /**
   * 認証済みかどうかを確認します
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
