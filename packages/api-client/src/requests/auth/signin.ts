import type {
  AuthResponse,
  SigninRequest,
} from "@simple-markdown-note/common/schemas";
import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

/**
 * ログインを実行する
 */
export const signin = async (
  api: ApiClient,
  data: SigninRequest
): Promise<AuthResponse> => {
  const url = api.auth.signin.$url();
  console.log(`[API] [signin] POST ${url}`, { ...data, password: "***" });
  const res = await api.auth.signin.$post({ json: data });
  console.log(`[API] [signin] Response: ${res.status} ${res.url}`);
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    console.error("[API] [signin] Error:", errorData);
    throw new ApiClientError(
      errorData.error || "Login failed",
      res.status,
      errorData
    );
  }
  return res.json() as Promise<AuthResponse>;
};
