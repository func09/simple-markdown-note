import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRequests from "../../requests/auth/verifyEmail";
import { createWrapper } from "./testUtils";
import { useVerifyEmail } from "./useVerifyEmail";

vi.mock("../../requests/auth/verifyEmail");

describe("useVerifyEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("should handle without options", async () => {
    vi.mocked(authRequests.verifyEmail).mockResolvedValue(undefined);

    const { result } = renderHook(() => useVerifyEmail(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("token");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.verifyEmail).toHaveBeenCalled();
  });

  it("should call onError on failure", async () => {
    const onError = vi.fn();
    const error = new Error("Verification failed");
    vi.mocked(authRequests.verifyEmail).mockRejectedValue(error);

    const { result } = renderHook(() => useVerifyEmail({ onError }), {
      wrapper: createWrapper(),
    });

    result.current.mutate("token");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(onError).toHaveBeenCalledWith(error);
  });

  it("should handle error without options", async () => {
    const error = new Error("Verification failed");
    vi.mocked(authRequests.verifyEmail).mockRejectedValue(error);

    const { result } = renderHook(() => useVerifyEmail(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("token");

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
