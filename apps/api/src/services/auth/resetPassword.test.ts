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
import { resetPassword } from "./resetPassword";

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

// パスワード再設定処理のテストスイート
describe("resetPassword", () => {
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

  beforeAll(() => {
    vi.spyOn(globalThis.crypto.subtle, "digest").mockResolvedValue(
      new Uint8Array([2, 2, 2]).buffer as unknown as ArrayBuffer
    );
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  // 正当なトークンによりパスワードが再設定されることを確認する
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
    expect(mockPasswordResetRepo.deleteByUserId).toHaveBeenCalledWith("user_1");
  });

  // トークンの有効期限が切れている場合はエラーが投げられることを確認する
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

  // 無効なトークンが渡された場合はエラーが投げられることを確認する
  it("should throw error if token is invalid", async () => {
    mockPasswordResetRepo.findByTokenHash.mockResolvedValue(null);

    await expect(resetPassword(db, "raw_token", "new_p")).rejects.toThrow(
      HTTPException
    );
  });
});
