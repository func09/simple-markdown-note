import { zodResolver } from "@hookform/resolvers/zod";
import { useSignup } from "@simple-markdown-note/api-client/hooks";
import type { SignupRequest } from "@simple-markdown-note/common/schemas";
import { SignupRequestSchema } from "@simple-markdown-note/common/schemas";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store";

/**
 * サインアップ画面用のカスタムフック
 * フォーム管理、API連携、認証情報の保存、画面遷移を制御します。
 */
export function useSignupScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    mutate: signupMutate,
    isPending: isLoading,
    error: apiError,
  } = useSignup({
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.replace("/(main)/notes");
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupRequest>({
    resolver: zodResolver(SignupRequestSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignupRequest) => {
    signupMutate(data);
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isLoading,
    apiError,
  };
}
