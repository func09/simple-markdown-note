import {
  bcryptjs,
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { HTTPException } from "hono/http-exception";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getUserById, signin, signup } from "./auth";

vi.mock("@simple-markdown-note/database", () => ({
  bcryptjs: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
  createUserRepository: vi.fn(),
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createUserRepository).mockReturnValue(
      mockUserRepo as unknown as ReturnType<typeof createUserRepository>
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
});
