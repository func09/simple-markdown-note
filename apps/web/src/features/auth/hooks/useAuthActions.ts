import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { logout, signin, signup } from "../features/auth/api";

/**
 * 認証に関連するアクションを管理するカスタムフック
 */
export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * ログイン処理を実行する
   */
  const handleLogin = useCallback(
    async (data: { email: string; password: string }) => {
      setIsLoading(true);
      try {
        const res = await signin(data);
        localStorage.setItem("token", res.token);
        toast.success("Logged in successfully");
        navigate("/notes");
      } catch (err: unknown) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Login failed. Please check your credentials."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  /**
   * 新規登録処理を実行する
   */
  const handleSignup = useCallback(
    async (data: { email: string; password: string }) => {
      setIsLoading(true);
      try {
        await signup(data);
        toast.success("Successfully signed up! Please login.");
        navigate("/login");
      } catch (err: unknown) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Signup failed. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  /**
   * ログアウト処理を実行する
   */
  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logout();
      // ログアウト時は状態を完全にリセットするため、window.location を使用してリロードを伴う遷移を行う
      window.location.href = "/login";
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    handleLogin,
    handleSignup,
    handleLogout,
  };
}
