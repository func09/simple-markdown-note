import {
  createEmailVerificationRepository,
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { HTTPException } from "hono/http-exception";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifyEmail } from "./verifyEmail";

vi.mock("@simple-markdown-note/database", () => ({
  createUserRepository: vi.fn(),
  createEmailVerificationRepository: vi.fn(),
}));

// メール検証処理のテストスイート
describe("verifyEmail", () => {
  const db = {} as DrizzleDB;
  const mockUserRepo = {
    updateStatus: vi.fn(),
  };
  const mockVerifyRepo = {
    findByToken: vi.fn(),
    deleteByUserId: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createUserRepository).mockReturnValue(
      mockUserRepo as unknown as ReturnType<typeof createUserRepository>
    );
    vi.mocked(createEmailVerificationRepository).mockReturnValue(
      mockVerifyRepo as unknown as ReturnType<
        typeof createEmailVerificationRepository
      >
    );
  });

  // トークンが正当な場合にメールの検証が完了することを確認する
  it("should verify email with valid token", async () => {
    const futureDate = new Date();
    futureDate.setMinutes(futureDate.getMinutes() + 10);
    mockVerifyRepo.findByToken.mockResolvedValue({
      userId: "user_1",
      expiresAt: futureDate,
    });

    await verifyEmail(db, "valid_token");

    expect(mockVerifyRepo.findByToken).toHaveBeenCalledWith("valid_token");
    expect(mockUserRepo.updateStatus).toHaveBeenCalledWith("user_1", "active");
    expect(mockVerifyRepo.deleteByUserId).toHaveBeenCalledWith("user_1");
  });

  // トークンの有効期限が切れている場合はエラーが投げられることを確認する
  it("should throw error if token expires", async () => {
    const pastDate = new Date();
    pastDate.setMinutes(pastDate.getMinutes() - 10);
    mockVerifyRepo.findByToken.mockResolvedValue({
      userId: "user_1",
      expiresAt: pastDate,
    });

    await expect(verifyEmail(db, "raw_token")).rejects.toThrow(HTTPException);
  });

  // 無効なトークンが渡された場合はエラーが投げられることを確認する
  it("should throw error if token is invalid", async () => {
    mockVerifyRepo.findByToken.mockResolvedValue(null);

    await expect(verifyEmail(db, "raw_token")).rejects.toThrow(HTTPException);
  });
});
