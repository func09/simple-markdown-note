import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { logout } from "./logout";
import { createApiMock } from "./mockApi";

describe("logout", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  it("should succeed on 200/204", async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      url: "http://localhost/api/auth/logout",
    };
    apiMock.auth.logout.$delete.mockResolvedValue(mockResponse);

    await expect(
      logout(apiMock as unknown as ApiClient)
    ).resolves.not.toThrow();
  });

  it("should throw on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      url: "http://localhost/api/auth/logout",
    };
    apiMock.auth.logout.$delete.mockResolvedValue(mockResponse);

    await expect(logout(apiMock as unknown as ApiClient)).rejects.toThrow(
      "Logout failed"
    );
  });
});
