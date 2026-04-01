import { useMutation } from "@tanstack/react-query";
import type { AuthResponse, SigninRequest } from "api/schema";
import { useApi } from "../context";
import { signin } from "../requests/authRequests";

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
