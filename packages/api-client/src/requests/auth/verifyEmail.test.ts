import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { createApiMock } from "./mockApi";
import { verifyEmail } from "./verifyEmail";

describe("verifyEmail", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  it("should succeed on ok response", async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      url: "http://localhost/api/auth/verify-email",
    };
    apiMock.auth["verify-email"].$get.mockResolvedValue(mockResponse);

    await expect(
      verifyEmail(apiMock as unknown as ApiClient, "token")
    ).resolves.not.toThrow();
  });

  it("should throw error on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      url: "http://localhost/api/auth/verify-email",
      json: async () => ({ error: "Token invalid" }),
    };
    apiMock.auth["verify-email"].$get.mockResolvedValue(mockResponse);

    await expect(
      verifyEmail(apiMock as unknown as ApiClient, "token")
    ).rejects.toThrow("Token invalid");
  });
});
