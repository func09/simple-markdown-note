import type {
  AuthResponse,
  SignupRequest,
} from "@simple-markdown-note/schemas";
import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

/**
 * 新規登録を実行する
 */
export const signup = async (
  api: ApiClient,
  data: SignupRequest
): Promise<AuthResponse> => {
  const url = api.auth.signup.$url();
  console.log(`[API] [signup] POST ${url}`, { ...data, password: "***" });
  const res = await api.auth.signup.$post({ json: data });
  console.log(`[API] [signup] Response: ${res.status} ${res.url}`);
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    console.error("[API] [signup] Error:", errorData);
    throw new ApiClientError(
      errorData.error || "Signup failed",
      res.status,
      errorData
    );
  }
  return res.json() as Promise<AuthResponse>;
};
