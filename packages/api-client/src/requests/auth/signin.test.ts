import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { createApiMock } from "./mockApi";
import { signin } from "./signin";

describe("signin", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  it("should return AuthResponse on success", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      url: "http://localhost/api/auth/signin",
      json: async () => ({
        user: { id: "1", email: "test@example.com" },
        token: "token123",
      }),
    };
    apiMock.auth.signin.$post.mockResolvedValue(mockResponse);

    const result = await signin(apiMock as unknown as ApiClient, {
      email: "test@example.com",
      password: "password",
    });

    expect(result.token).toBe("token123");
    expect(apiMock.auth.signin.$post).toHaveBeenCalledWith({
      json: { email: "test@example.com", password: "password" },
    });
  });

  it("should throw error on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      url: "http://localhost/api/auth/signin",
      json: async () => ({ error: "Invalid credentials" }),
    };
    apiMock.auth.signin.$post.mockResolvedValue(mockResponse);

    await expect(
      signin(apiMock as unknown as ApiClient, {
        email: "test@example.com",
        password: "wrong",
      })
    ).rejects.toThrow("Invalid credentials");
  });
});
