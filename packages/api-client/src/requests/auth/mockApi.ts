import { vi } from "vitest";
/**
 * テスト環境用にAPIクライアントのモックオブジェクトを生成します。
 * hcのインターフェースに合わせて各種エンドポイントのモックメソッドを提供します。
 */
export const createApiMock = () => ({
  auth: {
    signin: {
      $post: vi.fn(),
      $url: () => new URL("http://localhost/api/auth/signin"),
    },
    signup: {
      $post: vi.fn(),
      $url: () => new URL("http://localhost/api/auth/signup"),
    },
    me: { $get: vi.fn(), $url: () => new URL("http://localhost/api/auth/me") },
    logout: {
      $delete: vi.fn(),
      $url: () => new URL("http://localhost/api/auth/logout"),
    },
    resetPassword: {
      $post: vi.fn(),
      $url: () => new URL("http://localhost/api/auth/reset-password"),
    },
    "forgot-password": {
      $post: vi.fn(),
      $url: () => new URL("http://localhost/api/auth/forgot-password"),
    },
    verifyEmail: {
      $get: vi.fn(),
      $url: () => new URL("http://localhost/api/auth/verify-email"),
    },
    "resend-verification": {
      $post: vi.fn(),
      $url: () => new URL("http://localhost/api/auth/resend-verification"),
    },
  },
});
