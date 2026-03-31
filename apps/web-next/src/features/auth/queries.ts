import { useMutation } from "@tanstack/react-query";
import type { SigninRequest } from "api";
import { signin } from "./api";
import { useAuthStore } from "./store";

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
