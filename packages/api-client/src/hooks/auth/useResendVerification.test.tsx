import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRequests from "../../requests/auth/resendVerification";
import { createWrapper } from "./testUtils";
import { useResendVerification } from "./useResendVerification";

vi.mock("../../requests/auth/resendVerification");

describe("useResendVerification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call resendVerification and onSuccess", async () => {
    const onSuccess = vi.fn();
    vi.mocked(authRequests.resendVerification).mockResolvedValue(undefined);

    const { result } = renderHook(() => useResendVerification({ onSuccess }), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: "test@example.com" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.resendVerification).toHaveBeenCalledWith(
      expect.anything(),
      { email: "test@example.com" }
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should handle without options", async () => {
    vi.mocked(authRequests.resendVerification).mockResolvedValue(undefined);

    const { result } = renderHook(() => useResendVerification(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: "t@e.com" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.resendVerification).toHaveBeenCalled();
  });
});
