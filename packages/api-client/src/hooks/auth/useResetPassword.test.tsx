import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRequests from "../../requests/auth/resetPassword";
import { createWrapper } from "./testUtils";
import { useResetPassword } from "./useResetPassword";

vi.mock("../../requests/auth/resetPassword");

describe("useResetPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("should handle without options", async () => {
    vi.mocked(authRequests.resetPassword).mockResolvedValue(undefined);

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ token: "t", password: "p", confirmPassword: "p" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.resetPassword).toHaveBeenCalled();
  });
});
