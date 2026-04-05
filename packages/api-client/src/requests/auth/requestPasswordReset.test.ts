import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { createApiMock } from "./mockApi";
import { requestPasswordReset } from "./requestPasswordReset";

describe("requestPasswordReset", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  it("should succeed on ok response", async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      url: "http://localhost/api/auth/forgot-password",
    };
    apiMock.auth["forgot-password"].$post.mockResolvedValue(mockResponse);

    await expect(
      requestPasswordReset(apiMock as unknown as ApiClient, {
        email: "test@example.com",
      })
    ).resolves.not.toThrow();
  });

  it("should throw error on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      url: "http://localhost/api/auth/forgot-password",
      json: async () => ({ error: "Email not found" }),
    };
    apiMock.auth["forgot-password"].$post.mockResolvedValue(mockResponse);

    await expect(
      requestPasswordReset(apiMock as unknown as ApiClient, {
        email: "test@example.com",
      })
    ).rejects.toThrow("Email not found");
  });
});
