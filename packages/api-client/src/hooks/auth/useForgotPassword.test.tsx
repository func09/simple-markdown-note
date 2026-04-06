import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRequests from "../../requests/auth/requestPasswordReset";
import { createWrapper } from "./testUtils";
import { useForgotPassword } from "./useForgotPassword";

vi.mock("../../requests/auth/requestPasswordReset");

describe("useForgotPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
