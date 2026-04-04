import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin, useSignup } from "@simple-markdown-note/api-client/hooks";
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
import { useAuthStore } from "../store";

/**
 * ログイン画面用のカスタムフック
 * フォーム管理、API連携、認証情報の保存、画面遷移を制御します。
 */
export function useLoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    mutate: loginMutate,
    isPending: isLoading,
    error: apiError,
  } = useLogin({
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.replace("/(main)/notes");
    },
  });

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
