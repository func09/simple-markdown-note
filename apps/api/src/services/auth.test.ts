import {
  bcryptjs,
  createPasswordResetRepository,
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { HTTPException } from "hono/http-exception";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { AppEnv } from "../types";
import {
  getUserById,
  requestPasswordReset,
  resetPassword,
  signin,
  signup,
} from "./auth";

vi.mock("@simple-markdown-note/database", () => ({
  bcryptjs: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
  createUserRepository: vi.fn(),
  createPasswordResetRepository: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn() },
  })),
}));

vi.mock("@simple-markdown-note/emails", () => ({
  renderResetPasswordEmail: vi.fn().mockResolvedValue({
    html: "<p>test</p>",
    text: "test",
  }),
}));

// 型情報を取得するためにキャスト
const mockedBcrypt = bcryptjs as unknown as {
  hash: ReturnType<typeof vi.fn>;
  compare: ReturnType<typeof vi.fn>;
};

describe("auth service", () => {
  const db = {} as DrizzleDB;
  const mockUserRepo = {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    updatePassword: vi.fn(),
  };
  const mockPasswordResetRepo = {
    create: vi.fn(),
    deleteByUserId: vi.fn(),
    findByTokenHash: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createUserRepository).mockReturnValue(
      mockUserRepo as unknown as ReturnType<typeof createUserRepository>
    );
    vi.mocked(createPasswordResetRepository).mockReturnValue(
      mockPasswordResetRepo as unknown as ReturnType<
        typeof createPasswordResetRepository
      >
    );
  });

  describe("signup", () => {
    it("should create a new user with hashed password", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue("hashed_password");
      mockUserRepo.create.mockResolvedValue({
        id: "1",
        email: "test@example.com",
      });

      const result = await signup(db, {
        email: "test@example.com",
        password: "password123",
      });

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith("test@example.com");
      expect(mockedBcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(mockUserRepo.create).toHaveBeenCalledWith({
        email: "test@example.com",
        passwordHash: "hashed_password",
      });
      expect(result).toEqual({ id: "1", email: "test@example.com" });
    });

    it("should throw HTTPException if user already exists", async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: "1" });

      await expect(
        signup(db, { email: "test@example.com", password: "password" })
      ).rejects.toThrow(HTTPException);
    });
  });

  describe("signin", () => {
    it("should return user if credentials are valid", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        passwordHash: "hash",
      };
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true);

      const result = await signin(db, {
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toEqual(mockUser);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith("password123", "hash");
    });

    it("should throw HTTPException if user not found", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(
        signin(db, { email: "notfound@example.com", password: "password" })
      ).rejects.toThrow(HTTPException);
    });

    it("should throw HTTPException if password does not match", async () => {
      mockUserRepo.findByEmail.mockResolvedValue({
        passwordHash: "hash",
      });
      mockedBcrypt.compare.mockResolvedValue(false);

      await expect(
        signin(db, { email: "test@example.com", password: "wrong" })
      ).rejects.toThrow(HTTPException);
    });
  });

  describe("getUserById", () => {
    it("should return user by id", async () => {
      mockUserRepo.findById.mockResolvedValue({
        id: "1",
        email: "test@example.com",
      });

      const result = await getUserById(db, "1");

      expect(mockUserRepo.findById).toHaveBeenCalledWith("1");
      expect(result).toEqual({ id: "1", email: "test@example.com" });
    });
  });

  describe("requestPasswordReset", () => {
    beforeAll(() => {
      vi.spyOn(globalThis.crypto, "getRandomValues").mockImplementation(
        (arr: unknown) => {
          (arr as Uint8Array).fill(1);
          return arr as Uint8Array;
        }
      );
      vi.spyOn(globalThis.crypto.subtle, "digest").mockResolvedValue(
        new Uint8Array([2, 2, 2]).buffer as unknown as ArrayBuffer
      );
    });

    afterAll(() => {
      vi.restoreAllMocks();
    });

    it("should process password reset for existing user", async () => {
      const mockEnv = {
        RESEND_API_KEY: "re_test",
        DB: {},
        JWT_SECRET: "secret",
      } as unknown as AppEnv["Bindings"];
      mockUserRepo.findByEmail.mockResolvedValue({
        id: "user_1",
        email: "test@example.com",
      });

      await requestPasswordReset(db, "test@example.com", mockEnv);

      expect(mockPasswordResetRepo.deleteByUserId).toHaveBeenCalledWith(
        "user_1"
      );
      expect(mockPasswordResetRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user_1",
          tokenHash: "020202",
        })
      );

      const { Resend } = await import("resend");
      expect(Resend).toHaveBeenCalledWith("re_test");
      expect(
        vi.mocked(Resend).mock.results[0].value.emails.send
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
        })
      );
    });

    it("should fail gracefully if user doesn't exist", async () => {
      const mockEnv = {
        RESEND_API_KEY: "re_test",
        DB: {},
        JWT_SECRET: "secret",
      } as unknown as AppEnv["Bindings"];
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await requestPasswordReset(db, "unknown@example.com", mockEnv);

      expect(mockPasswordResetRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    beforeAll(() => {
      vi.spyOn(globalThis.crypto.subtle, "digest").mockResolvedValue(
        new Uint8Array([2, 2, 2]).buffer as unknown as ArrayBuffer
      );
    });

    afterAll(() => {
      vi.restoreAllMocks();
    });

    it("should reset password with valid token", async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 10);
      mockPasswordResetRepo.findByTokenHash.mockResolvedValue({
        userId: "user_1",
        expiresAt: futureDate,
      });
      mockedBcrypt.hash.mockResolvedValue("new_hashed_password");

      await resetPassword(db, "raw_token", "new_p");

      expect(mockPasswordResetRepo.findByTokenHash).toHaveBeenCalledWith(
        "020202"
      );
      expect(mockedBcrypt.hash).toHaveBeenCalledWith("new_p", 10);
      expect(mockUserRepo.updatePassword).toHaveBeenCalledWith(
        "user_1",
        "new_hashed_password"
      );
      expect(mockPasswordResetRepo.deleteByUserId).toHaveBeenCalledWith(
        "user_1"
      );
    });

    it("should throw error if token expires", async () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);
      mockPasswordResetRepo.findByTokenHash.mockResolvedValue({
        userId: "user_1",
        expiresAt: pastDate,
      });

      await expect(resetPassword(db, "raw_token", "new_p")).rejects.toThrow(
        HTTPException
      );
    });

    it("should throw error if token is invalid", async () => {
      mockPasswordResetRepo.findByTokenHash.mockResolvedValue(null);

      await expect(resetPassword(db, "raw_token", "new_p")).rejects.toThrow(
        HTTPException
      );
    });
  });
});
