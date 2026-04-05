import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRequests from "../../requests/auth/logout";
import { createWrapper } from "./test-utils";
import { useLogout } from "./useLogout";

vi.mock("../../requests/auth/logout");

describe("useLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
