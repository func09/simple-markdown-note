import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { createApiMock } from "./mockApi";
import { resendVerification } from "./resendVerification";

describe("resendVerification", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  it("should succeed on ok response", async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      url: "http://localhost/api/auth/resend-verification",
    };
    apiMock.auth["resend-verification"].$post.mockResolvedValue(mockResponse);

    await expect(
      resendVerification(apiMock as unknown as ApiClient, {
        email: "test@example.com",
      })
    ).resolves.not.toThrow();
  });

  it("should throw error on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      url: "http://localhost/api/auth/resend-verification",
      json: async () => ({ error: "Too many requests" }),
    };
    apiMock.auth["resend-verification"].$post.mockResolvedValue(mockResponse);

    await expect(
      resendVerification(apiMock as unknown as ApiClient, {
        email: "test@example.com",
      })
    ).rejects.toThrow("Too many requests");
  });

  it("should throw default error on failure when error message is missing", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      url: "http://localhost/api/auth/resend-verification",
      json: async () => ({}),
    };
    apiMock.auth["resend-verification"].$post.mockResolvedValue(mockResponse);

    await expect(
      resendVerification(apiMock as unknown as ApiClient, {
        email: "test@example.com",
      })
    ).rejects.toThrow("Resend verification failed");
  });
});
