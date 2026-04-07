import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { createApiMock } from "./mockApi";
import { signup } from "./signup";

describe("signup", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  it("should return AuthResponse on success", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      url: "http://localhost/api/auth/signup",
      json: async () => ({
        user: { id: "1", email: "test@example.com" },
        token: "token123",
      }),
    };
    apiMock.auth.signup.$post.mockResolvedValue(mockResponse);

    const result = await signup(apiMock as unknown as ApiClient, {
      email: "test@example.com",
      password: "password",
    });

    expect(result.token).toBe("token123");
  });

  it("should throw error on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      url: "http://localhost/api/auth/signup",
      json: async () => ({ error: "Email already taken" }),
    };
    apiMock.auth.signup.$post.mockResolvedValue(mockResponse);

    await expect(
      signup(apiMock as unknown as ApiClient, {
        email: "test@example.com",
        password: "password",
      })
    ).rejects.toThrow("Email already taken");
  });

  it("should throw default error on failure when error message is missing", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      url: "http://localhost/api/auth/signup",
      json: async () => ({}),
    };
    apiMock.auth.signup.$post.mockResolvedValue(mockResponse);

    await expect(
      signup(apiMock as unknown as ApiClient, {
        email: "test@example.com",
        password: "password",
      })
    ).rejects.toThrow("Signup failed");
  });
});
