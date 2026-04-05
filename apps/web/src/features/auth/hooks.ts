import { zodResolver } from "@hookform/resolvers/zod";
import { useSignup } from "@simple-markdown-note/api-client/hooks";
import type { SignupRequest } from "@simple-markdown-note/common/schemas";
import { SignupRequestSchema } from "@simple-markdown-note/common/schemas";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "./store";

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
