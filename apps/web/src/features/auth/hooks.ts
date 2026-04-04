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
import { useId } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "./store";

/**
 * ログインフォームのロジックを管理するカスタムフック
 */
export function useLoginForm() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const emailId = useId();
  const passwordId = useId();

  const {
    mutate: loginMutate,
    isPending: isLoading,
    error: apiError,
  } = useLogin({
    onSuccess: (data) => {
      setAuth(data.user);
    },
  });

  const {
    register,
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
    loginMutate(data, {
      onSuccess: () => {
        toast.success("Successfully logged in");
        navigate("/notes?scope=all");
      },
      onError: (err: Error) => {
        toast.error(err.message || "Login failed");
      },
    });
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isLoading,
    apiError,
    emailId,
    passwordId,
  };
}

/**
 * 新規登録フォームのロジックを管理するカスタムフック
 */
export function useSignupForm() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const emailId = useId();
  const passwordId = useId();

  const {
    mutate: signupMutate,
    isPending: isLoading,
    error: apiError,
  } = useSignup({
    onSuccess: (data) => {
      setAuth(data.user);
    },
  });

  const {
    register,
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
    signupMutate(data, {
      onSuccess: () => {
        toast.success("Successfully signed up!");
        navigate("/notes?scope=all");
      },
      onError: (err: Error) => {
        toast.error(err.message || "Signup failed");
      },
    });
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isLoading,
    apiError,
    emailId,
    passwordId,
  };
}
