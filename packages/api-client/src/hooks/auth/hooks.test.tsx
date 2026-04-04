import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { AuthResponse } from "common/schemas";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiClient } from "@/client";
import { ApiProvider } from "@/context";
import * as authRequests from "@/requests/authRequests";
import { useLogin, useLogout, useSignup } from "./hooks";

vi.mock("@/requests/authRequests");

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
});
