import type { AuthResponse } from "@simple-markdown-note/common/schemas";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiClient } from "@/client";
import { ApiProvider } from "@/context";
import {
  useForgotPassword,
  useLogin,
  useLogout,
  useResendVerification,
  useResetPassword,
  useSignup,
  useVerifyEmail,
} from "./hooks";
import * as authRequests from "./requests";

vi.mock("./requests");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ApiProvider client={{} as ApiClient}>{children}</ApiProvider>
    </QueryClientProvider>
  );
};

describe("authQueries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useLogin", () => {
    it("should call signin and onSuccess", async () => {
      const onSuccess = vi.fn();
      const mockData = { user: { id: "1" }, token: "tk" };
      vi.mocked(authRequests.signin).mockResolvedValue(
        mockData as unknown as AuthResponse
      );

      const { result } = renderHook(() => useLogin({ onSuccess }), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ email: "t@e.com", password: "p" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(authRequests.signin).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  describe("useSignup", () => {
    it("should call signup and onSuccess", async () => {
      const onSuccess = vi.fn();
      const mockData = { user: { id: "1" }, token: "tk" };
      vi.mocked(authRequests.signup).mockResolvedValue(
        mockData as unknown as AuthResponse
      );

      const { result } = renderHook(() => useSignup({ onSuccess }), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ email: "t@e.com", password: "p" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(authRequests.signup).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  describe("useLogout", () => {
    it("should call logout and onSuccess", async () => {
      const onSuccess = vi.fn();
      vi.mocked(authRequests.logout).mockResolvedValue(undefined);

      const { result } = renderHook(() => useLogout({ onSuccess }), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(authRequests.logout).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe("useResetPassword", () => {
    it("should call resetPassword and onSuccess", async () => {
      const onSuccess = vi.fn();
      vi.mocked(authRequests.resetPassword).mockResolvedValue(undefined);

      const { result } = renderHook(() => useResetPassword({ onSuccess }), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        token: "t",
        password: "p",
        confirmPassword: "p",
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(authRequests.resetPassword).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe("useForgotPassword", () => {
    it("should call requestPasswordReset and onSuccess", async () => {
      const onSuccess = vi.fn();
      vi.mocked(authRequests.requestPasswordReset).mockResolvedValue(undefined);

      const { result } = renderHook(() => useForgotPassword({ onSuccess }), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ email: "t@e.com" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(authRequests.requestPasswordReset).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe("useVerifyEmail", () => {
    it("should call verifyEmail and onSuccess", async () => {
      const onSuccess = vi.fn();
      vi.mocked(authRequests.verifyEmail).mockResolvedValue(undefined);

      const { result } = renderHook(() => useVerifyEmail({ onSuccess }), {
        wrapper: createWrapper(),
      });

      result.current.mutate("token");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(authRequests.verifyEmail).toHaveBeenCalledWith(
        expect.anything(),
        "token"
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe("useResendVerification", () => {
    it("should call resendVerification and onSuccess", async () => {
      const onSuccess = vi.fn();
      vi.mocked(authRequests.resendVerification).mockResolvedValue(undefined);

      const { result } = renderHook(
        () => useResendVerification({ onSuccess }),
        {
          wrapper: createWrapper(),
        }
      );

      result.current.mutate({ email: "test@example.com" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(authRequests.resendVerification).toHaveBeenCalledWith(
        expect.anything(),
        { email: "test@example.com" }
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
