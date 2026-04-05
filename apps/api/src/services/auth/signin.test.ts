import {
  bcryptjs,
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { HTTPException } from "hono/http-exception";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signin } from "./signin";

vi.mock("@simple-markdown-note/database", () => ({
  bcryptjs: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
  createUserRepository: vi.fn(),
  createPasswordResetRepository: vi.fn(),
  createEmailVerificationRepository: vi.fn(),
}));

const mockedBcrypt = bcryptjs as unknown as {
  hash: ReturnType<typeof vi.fn>;
  compare: ReturnType<typeof vi.fn>;
};

describe("signin", () => {
  const db = {} as DrizzleDB;
  const mockUserRepo = {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    updatePassword: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createUserRepository).mockReturnValue(
      mockUserRepo as unknown as ReturnType<typeof createUserRepository>
    );
  });

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
