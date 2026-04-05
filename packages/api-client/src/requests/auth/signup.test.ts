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
});
