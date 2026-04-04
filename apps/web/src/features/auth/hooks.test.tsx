import * as apiClientHooks from "@simple-markdown-note/api-client/hooks";
import type { AuthResponse } from "@simple-markdown-note/common/schemas";
import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLoginForm, useSignupForm } from "./hooks";
import { useAuthStore } from "./store";

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@simple-markdown-note/api-client/hooks", () => ({
  useLogin: vi.fn(),
  useSignup: vi.fn(),
}));

const mockedHooks = vi.mocked(apiClientHooks);

describe("useLoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    mockedHooks.useLogin.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof apiClientHooks.useLogin>);

    const { result } = renderHook(() => useLoginForm());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.apiError).toBe(null);
    expect(typeof result.current.emailId).toBe("string");
    expect(typeof result.current.passwordId).toBe("string");
  });

  it("should handle successful login", async () => {
    let hookOnSuccess: ((data: AuthResponse) => void) | undefined;
    const mockMutate = vi.fn((_data, options) => {
      const successData: AuthResponse = {
        user: {
          id: "1",
          email: "test@example.com",
          createdAt: "2026-03-25T12:00:00Z",
          updatedAt: "2026-03-25T12:00:00Z",
        },
        token: "mock-token",
      };
      if (hookOnSuccess) hookOnSuccess(successData);
      options.onSuccess(successData);
    });

    mockedHooks.useLogin.mockImplementation((options) => {
      hookOnSuccess = options?.onSuccess;
      return {
        mutate: mockMutate,
        isPending: false,
        error: null,
      } as unknown as ReturnType<typeof apiClientHooks.useLogin>;
    });

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      result.current.onSubmit({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(mockMutate).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toEqual({
      id: "1",
      email: "test@example.com",
      createdAt: "2026-03-25T12:00:00Z",
      updatedAt: "2026-03-25T12:00:00Z",
    });
    expect(toast.success).toHaveBeenCalledWith("Successfully logged in");
    expect(mockNavigate).toHaveBeenCalledWith("/notes?scope=all");
  });

  it("should handle login error", async () => {
    const mockMutate = vi.fn((_data, options) => {
      options.onError(new Error("Invalid credentials"));
    });
    mockedHooks.useLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof apiClientHooks.useLogin>);

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      result.current.onSubmit({
        email: "test@example.com",
        password: "wrong-password",
      });
    });

    expect(mockMutate).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
  });
});

describe("useSignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    mockedHooks.useSignup.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof apiClientHooks.useSignup>);

    const { result } = renderHook(() => useSignupForm());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.apiError).toBe(null);
    expect(typeof result.current.emailId).toBe("string");
    expect(typeof result.current.passwordId).toBe("string");
  });

  it("should handle successful signup", async () => {
    let hookOnSuccess: ((data: AuthResponse) => void) | undefined;
    const mockMutate = vi.fn((_data, options) => {
      const successData: AuthResponse = {
        user: {
          id: "2",
          email: "newuser@example.com",
          createdAt: "2026-03-25T12:00:00Z",
          updatedAt: "2026-03-25T12:00:00Z",
        },
        token: "new-token",
      };
      if (hookOnSuccess) hookOnSuccess(successData);
      options.onSuccess(successData);
    });

    mockedHooks.useSignup.mockImplementation((options) => {
      hookOnSuccess = options?.onSuccess;
      return {
        mutate: mockMutate,
        isPending: false,
        error: null,
      } as unknown as ReturnType<typeof apiClientHooks.useSignup>;
    });

    const { result } = renderHook(() => useSignupForm());

    await act(async () => {
      result.current.onSubmit({
        email: "newuser@example.com",
        password: "password123",
      });
    });

    expect(mockMutate).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toEqual({
      id: "2",
      email: "newuser@example.com",
      createdAt: "2026-03-25T12:00:00Z",
      updatedAt: "2026-03-25T12:00:00Z",
    });
    expect(toast.success).toHaveBeenCalledWith("Successfully signed up!");
    expect(mockNavigate).toHaveBeenCalledWith("/notes?scope=all");
  });

  it("should handle signup error", async () => {
    const mockMutate = vi.fn((_data, options) => {
      options.onError(new Error("Email already exists"));
    });
    mockedHooks.useSignup.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof apiClientHooks.useSignup>);

    const { result } = renderHook(() => useSignupForm());

    await act(async () => {
      result.current.onSubmit({
        email: "existing@example.com",
        password: "password123",
      });
    });

    expect(mockMutate).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Email already exists");
  });
});
