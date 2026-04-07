import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { createApiMock } from "./mockApi";
import { resetPassword } from "./resetPassword";

describe("resetPassword", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  it("should succeed on ok response", async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      url: "http://localhost/api/auth/reset-password",
    };
    apiMock.auth["reset-password"].$post.mockResolvedValue(mockResponse);

    await expect(
      resetPassword(apiMock as unknown as ApiClient, {
        token: "token",
        password: "newpassword",
        confirmPassword: "newpassword",
      })
    ).resolves.not.toThrow();
  });

  it("should throw error on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      url: "http://localhost/api/auth/reset-password",
      json: async () => ({ error: "Token invalid" }),
    };
    apiMock.auth["reset-password"].$post.mockResolvedValue(mockResponse);

    await expect(
      resetPassword(apiMock as unknown as ApiClient, {
        token: "token",
        password: "newpassword",
        confirmPassword: "newpassword",
      })
    ).rejects.toThrow("Token invalid");
  });

  it("should throw default error on failure when error message is missing", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      url: "http://localhost/api/auth/reset-password",
      json: async () => ({}),
    };
    apiMock.auth["reset-password"].$post.mockResolvedValue(mockResponse);

    await expect(
      resetPassword(apiMock as unknown as ApiClient, {
        token: "token",
        password: "newpassword",
        confirmPassword: "newpassword",
      })
    ).rejects.toThrow("Password reset failed");
  });
});
