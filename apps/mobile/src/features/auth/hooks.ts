import { zodResolver } from "@hookform/resolvers/zod";
import {
  useLogin as useLoginMutation,
  useSignup as useSignupMutation,
} from "@simple-markdown-note/api-client/hooks";
import type {
  SigninRequest,
  SignupRequest,
} from "@simple-markdown-note/common/schemas";
import {
  SigninRequestSchema,
  SignupRequestSchema,
} from "@simple-markdown-note/common/schemas";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { useAuthStore } from "./store";

/**
 * ログイン画面用のカスタムフック
 * フォーム管理、API連携、認証情報の保存、画面遷移を制御します。
 */
export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // ログインミューテーションの設定
  const {
    mutate: loginMutate,
    isPending: isLoading,
    error: apiError,
  } = useLoginMutation({
    onSuccess: (data) => {
      // 認証情報をストアに保存
      setAuth(data.user, data.token);
      // メイン画面へ遷移
      router.replace("/(main)/notes");
    },
  });

  // フォームの初期化
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninRequest>({
    resolver: zodResolver(SigninRequestSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /**
   * フォーム送信時の処理
   */
  const onSubmit = (data: SigninRequest) => {
    loginMutate(data);
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isLoading,
    apiError,
  };
}

/**
 * サインアップ画面用のカスタムフック
 * フォーム管理、API連携、認証情報の保存、画面遷移を制御します。
 */
export function useSignup() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // サインアップミューテーションの設定
  const {
    mutate: signupMutate,
    isPending: isLoading,
    error: apiError,
  } = useSignupMutation({
    onSuccess: (data) => {
      // 認証情報をストアに保存
      setAuth(data.user, data.token);
      // メイン画面へ遷移
      router.replace("/(main)/notes");
    },
  });

  // フォームの初期化
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

  /**
   * フォーム送信時の処理
   */
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
