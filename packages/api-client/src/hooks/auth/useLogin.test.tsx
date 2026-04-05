import type { AuthResponse } from "@simple-markdown-note/common/schemas";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRequests from "../../requests/auth/signin";
import { createWrapper } from "./test-utils";
import { useLogin } from "./useLogin";

vi.mock("../../requests/auth/signin");

describe("useLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
