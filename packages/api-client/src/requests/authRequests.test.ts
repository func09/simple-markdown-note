import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../client";
import { getMe, logout, signin, signup } from "./authRequests";

const createApiMock = () => ({
  auth: {
    signin: { $post: vi.fn() },
    signup: { $post: vi.fn() },
    me: { $get: vi.fn() },
    logout: { $delete: vi.fn() },
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
      };
      apiMock.auth.logout.$delete.mockResolvedValue(mockResponse);

      await expect(
        logout(apiMock as unknown as ApiClient)
      ).resolves.not.toThrow();
    });

    it("should throw on failure", async () => {
      const mockResponse = {
        ok: false,
      };
      apiMock.auth.logout.$delete.mockResolvedValue(mockResponse);

      await expect(logout(apiMock as unknown as ApiClient)).rejects.toThrow(
        "Logout failed"
      );
    });
  });
});
