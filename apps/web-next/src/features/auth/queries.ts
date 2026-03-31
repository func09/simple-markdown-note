import { useMutation } from "@tanstack/react-query";
import type { SigninRequest, SignupRequest } from "api";
import { logout, signin, signup } from "./api";
import { useAuthStore } from "./store";

/**
 * ログインを実行するミューテーションフック
 * 成功時に取得したユーザー情報をグローバルストアに保存する
 */
export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: SigninRequest) => signin(data),
    onSuccess: (data) => {
      // 認証成功時にユーザー情報をストアに保存
      setAuth(data.user);
    },
  });
};

/**
 * 新規登録を実行するミューテーションフック
 * 成功時に取得したユーザー情報をグローバルストアに保存する
 */
export const useSignup = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: SignupRequest) => signup(data),
    onSuccess: (data) => {
      // 登録成功時にユーザー情報をストアに保存
      setAuth(data.user);
    },
  });
};

/**
 * ログアウトを実行するミューテーションフック
 * 成功時にグローバルストアの認証情報をクリアする
 */
export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      // ログアウト成功時にストアをクリア
      clearAuth();
    },
  });
};
