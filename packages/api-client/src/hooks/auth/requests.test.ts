import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client";
import { getMe, logout, signin, signup } from "./requests";

const createApiMock = () => ({
  auth: {
    signin: {
      $post: vi.fn(),
      $url: () => new URL("http://localhost/api/auth/signin"),
    },
    signup: {
      $post: vi.fn(),
      $url: () => new URL("http://localhost/api/auth/signup"),
    },
    me: { $get: vi.fn(), $url: () => new URL("http://localhost/api/auth/me") },
    logout: {
      $delete: vi.fn(),
      $url: () => new URL("http://localhost/api/auth/logout"),
    },
    "reset-password": {
      $post: vi.fn(),
      $url: () => new URL("http://localhost/api/auth/reset-password"),
    },
    "forgot-password": {
      $post: vi.fn(),
      $url: () => new URL("http://localhost/api/auth/forgot-password"),
    },
  },
});

describe("authRequests", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  describe("signin", () => {
    it("should return AuthResponse on success", async () => {
      const mockResponse = {
        ok: true,
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

  describe("signup", () => {
    it("should return AuthResponse on success", async () => {
      const mockResponse = {
        ok: true,
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

  describe("getMe", () => {
    it("should return MeResponse on success", async () => {
      const mockResponse = {
        ok: true,
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

  describe("logout", () => {
    it("should succeed on 200/204", async () => {
      const mockResponse = {
        ok: true,
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
        url: "http://localhost/api/auth/logout",
      };
      apiMock.auth.logout.$delete.mockResolvedValue(mockResponse);

      await expect(logout(apiMock as unknown as ApiClient)).rejects.toThrow(
        "Logout failed"
      );
    });
  });

  describe("resetPassword", () => {
    it("should succeed on ok response", async () => {
      const mockResponse = {
        ok: true,
        url: "http://localhost/api/auth/reset-password",
      };
      apiMock.auth["reset-password"].$post.mockResolvedValue(mockResponse);

      await expect(
        import("./requests").then((m) =>
          m.resetPassword(apiMock as unknown as ApiClient, {
            token: "token",
            password: "newpassword",
            confirmPassword: "newpassword",
          })
        )
      ).resolves.not.toThrow();
    });

    it("should throw error on failure", async () => {
      const mockResponse = {
        ok: false,
        url: "http://localhost/api/auth/reset-password",
        json: async () => ({ error: "Token invalid" }),
      };
      apiMock.auth["reset-password"].$post.mockResolvedValue(mockResponse);

      await expect(
        import("./requests").then((m) =>
          m.resetPassword(apiMock as unknown as ApiClient, {
            token: "token",
            password: "newpassword",
            confirmPassword: "newpassword",
          })
        )
      ).rejects.toThrow("Token invalid");
    });
  });

  describe("requestPasswordReset", () => {
    it("should succeed on ok response", async () => {
      const mockResponse = {
        ok: true,
        url: "http://localhost/api/auth/forgot-password",
      };
      apiMock.auth["forgot-password"].$post.mockResolvedValue(mockResponse);

      await expect(
        import("./requests").then((m) =>
          m.requestPasswordReset(apiMock as unknown as ApiClient, {
            email: "test@example.com",
          })
        )
      ).resolves.not.toThrow();
    });

    it("should throw error on failure", async () => {
      const mockResponse = {
        ok: false,
        url: "http://localhost/api/auth/forgot-password",
        json: async () => ({ error: "Email not found" }),
      };
      apiMock.auth["forgot-password"].$post.mockResolvedValue(mockResponse);

      await expect(
        import("./requests").then((m) =>
          m.requestPasswordReset(apiMock as unknown as ApiClient, {
            email: "test@example.com",
          })
        )
      ).rejects.toThrow("Email not found");
    });
  });
});
