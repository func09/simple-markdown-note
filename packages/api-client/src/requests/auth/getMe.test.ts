import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { getMe } from "./getMe";
import { createApiMock } from "./mockApi";

describe("getMe", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  it("should return MeResponse on success", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      url: "http://localhost/api/auth/me",
      json: async () => ({ id: "1", email: "test@example.com" }),
    };
    apiMock.auth.me.$get.mockResolvedValue(mockResponse);

    const result = await getMe(apiMock as unknown as ApiClient);

    expect(result?.email).toBe("test@example.com");
  });

  it("should return null on 401", async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      url: "http://localhost/api/auth/me",
    };
    apiMock.auth.me.$get.mockResolvedValue(mockResponse);

    const result = await getMe(apiMock as unknown as ApiClient);

    expect(result).toBeNull();
  });
});
