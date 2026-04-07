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

vi.mock("@simple-markdown-note/emails", () => ({
  renderResetPasswordEmail: vi.fn().mockResolvedValue({
    html: "<p>test</p>",
    text: "test",
  }),
  renderVerifyEmail: vi.fn().mockResolvedValue({
    html: "<p>verify</p>",
    text: "verify",
  }),
}));

const mockedBcrypt = bcryptjs as unknown as {
  hash: ReturnType<typeof vi.fn>;
  compare: ReturnType<typeof vi.fn>;
};

// ユーザー登録処理のテストスイート
describe("signup", () => {
  const db = {} as DrizzleDB;
  const mockUserRepo = {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    updatePassword: vi.fn(),
    resurrectUser: vi.fn(),
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

  // 元のパスワードからハッシュ化された状態で新規ユーザーが作成されることを確認する
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

  // 既にユーザーが存在する場合はHTTPExceptionが投げられることを確認する
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

  // アカウントが論理削除状態のユーザーの場合は状態を復元して再登録処理を行うことを確認する
  it("should resurrect user if status is deleted", async () => {
    mockUserRepo.findByEmail.mockResolvedValue({
      id: "1",
      email: "test@example.com",
      status: "deleted",
    });
    mockedBcrypt.hash.mockResolvedValue("new_hashed_password");
    mockUserRepo.resurrectUser.mockResolvedValue({
      id: "1",
      email: "test@example.com",
      status: "pending",
    });

    const result = await signup(
      db,
      {
        email: "test@example.com",
        password: "newpassword",
      },
      {} as unknown as AppEnv["Bindings"]
    );

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(mockedBcrypt.hash).toHaveBeenCalledWith("newpassword", 10);
    expect(mockUserRepo.resurrectUser).toHaveBeenCalledWith(
      "1",
      "new_hashed_password"
    );
    expect(mockUserRepo.create).not.toHaveBeenCalled();
    expect(result).toEqual({
      id: "1",
      email: "test@example.com",
      status: "pending",
    });
  });

  // 新規作成が失敗してnullが返った場合にHTTPExceptionが投げられることを確認する
  it("should throw HTTPException if user creation fails and returns null", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue("hashed_password");
    mockUserRepo.create.mockResolvedValue(null);

    await expect(
      signup(
        db,
        { email: "fail@example.com", password: "password123" },
        {} as unknown as AppEnv["Bindings"]
      )
    ).rejects.toThrow(HTTPException);
  });

  // RESEND_API_KEYが提供されている場合は確認メールが送信されることを確認する
  it("should send verification email if RESEND_API_KEY is provided", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue("hashed_password");
    mockUserRepo.create.mockResolvedValue({
      id: "2",
      email: "resend@example.com",
    });

    fetchMock.mockResponseOnce(JSON.stringify({ id: "test-id" }));

    await signup(db, { email: "resend@example.com", password: "password123" }, {
      RESEND_API_KEY: "test-key",
      CLIENT_URL: "http://test",
      EMAIL_FROM: "test@domain.com",
      NODE_ENV: "test",
    } as unknown as AppEnv["Bindings"]);

    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    const body = JSON.parse(requestInit?.body as string);
    // https://resend.com/docs/api-reference/emails/send-email に沿ったペイロードかの厳密な検証
    expect(body).toMatchObject({
      from: "Simple Markdown Note <test@domain.com>",
      to: "resend@example.com",
      subject: "Verify your email address",
      html: "<p>verify</p>",
      text: "verify",
      tags: [
        { name: "category", value: "verify_email" },
        { name: "env", value: "test" },
      ],
    });
    const headers = new Headers(requestInit?.headers);
    expect(headers.get("Authorization")).toBe("Bearer test-key");
  });

  // メール送信サービス側のエラーを適切にハンドルすることを確認する
  it("should handle Resend API error", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue("hashed_password");
    mockUserRepo.create.mockResolvedValue({
      id: "3",
      email: "resend-error@example.com",
    });

    fetchMock.mockResponseOnce(JSON.stringify({ message: "Resend failed" }), {
      status: 400,
    });

    await signup(
      db,
      { email: "resend-error@example.com", password: "password123" },
      { RESEND_API_KEY: "test-key" } as unknown as AppEnv["Bindings"]
    );
  });
});
