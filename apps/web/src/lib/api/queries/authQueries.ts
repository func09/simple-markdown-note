import { useMutation } from "@tanstack/react-query";
import type { AuthResponse, SigninRequest, SignupRequest } from "api/schema";
import { useApi } from "../context";
import { logout, signin, signup } from "../requests/authRequests";

export const useLogin = (options?: {
  onSuccess?: (data: AuthResponse) => void;
}) => {
  const api = useApi();
  const { onSuccess } = options ?? {};
  return useMutation({
    mutationFn: (params: SigninRequest) => signin(api, params),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  });
};

export const useSignup = (options?: {
  onSuccess?: (data: AuthResponse) => void;
}) => {
  const api = useApi();
  const { onSuccess } = options ?? {};
  return useMutation({
    mutationFn: (params: SignupRequest) => signup(api, params),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  });
};

export const useLogout = (options?: { onSuccess?: () => void }) => {
  const api = useApi();
  const { onSuccess } = options ?? {};

  return useMutation({
    mutationFn: () => logout(api),
    onSuccess: () => {
      onSuccess?.();
    },
  });
};
