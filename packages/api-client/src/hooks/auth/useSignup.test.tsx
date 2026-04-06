import type { AuthResponse } from "@simple-markdown-note/schemas";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRequests from "../../requests/auth/signup";
import { createWrapper } from "./testUtils";
import { useSignup } from "./useSignup";

vi.mock("../../requests/auth/signup");

describe("useSignup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
