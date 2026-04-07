import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRequests from "../../requests/auth/drop";
import { createWrapper } from "./testUtils";
import { useDeleteUser } from "./useDeleteUser";

vi.mock("../../requests/auth/drop");

describe("useDeleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call drop request and onSuccess callback", async () => {
    const onSuccess = vi.fn();
    vi.mocked(authRequests.drop).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteUser({ onSuccess }), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.drop).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should handle without options", async () => {
    vi.mocked(authRequests.drop).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.drop).toHaveBeenCalled();
  });
});
