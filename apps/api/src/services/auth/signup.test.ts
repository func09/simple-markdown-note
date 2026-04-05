import {
  bcryptjs,
  createEmailVerificationRepository,
  createPasswordResetRepository,
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { HTTPException } from "hono/http-exception";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppEnv } from "@/types";
import { signup } from "./signup";

vi.mock("@simple-markdown-note/database", () => ({
  bcryptjs: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
  createUserRepository: vi.fn(),
  createPasswordResetRepository: vi.fn(),
  createEmailVerificationRepository: vi.fn(),
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

const mockedBcrypt = bcryptjs as unknown as {
  hash: ReturnType<typeof vi.fn>;
  compare: ReturnType<typeof vi.fn>;
};

describe("signup", () => {
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
  const mockVerifyRepo = {
    create: vi.fn(),
    findByToken: vi.fn(),
    deleteByUserId: vi.fn(),
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
    vi.mocked(createEmailVerificationRepository).mockReturnValue(
      mockVerifyRepo as unknown as ReturnType<
        typeof createEmailVerificationRepository
      >
    );
  });

  it("should create a new user with hashed password", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue("hashed_password");
    mockUserRepo.create.mockResolvedValue({
      id: "1",
      email: "test@example.com",
    });

    const result = await signup(
      db,
      {
        email: "test@example.com",
        password: "password123",
      },
      {} as unknown as AppEnv["Bindings"]
    );

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
      signup(
        db,
        { email: "test@example.com", password: "password" },
        {} as unknown as AppEnv["Bindings"]
      )
    ).rejects.toThrow(HTTPException);
  });
});
