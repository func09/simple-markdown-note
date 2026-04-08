import {
  createPasswordResetRepository,
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { AppEnv } from "@/types";
import { requestPasswordReset } from "./requestPasswordReset";

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
}));

// パスワードリセットリクエスト処理のテストスイート
describe("requestPasswordReset", () => {
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
    vi.spyOn(globalThis.crypto, "getRandomValues").mockImplementation((arr) => {
      (arr as Uint8Array).fill(1);
      return arr;
    });
    vi.spyOn(globalThis.crypto.subtle, "digest").mockResolvedValue(
      new Uint8Array([2, 2, 2]).buffer as unknown as ArrayBuffer
    );
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  // 既存ユーザーに対するパスワードリセット要求が正常に処理されることを確認する
  it("should process password reset for existing user", async () => {
    const mockEnv = {
      RESEND_API_KEY: "re_test",
      DB: {},
      JWT_SECRET: "secret",
      NODE_ENV: "test",
    } as unknown as AppEnv["Bindings"];
    mockUserRepo.findByEmail.mockResolvedValue({
      id: "user_1",
      email: "test@example.com",
    });

    fetchMock.mockResponseOnce(JSON.stringify({ id: "test-id" }));

    await requestPasswordReset(db, "test@example.com", mockEnv);

    expect(mockPasswordResetRepo.deleteByUserId).toHaveBeenCalledWith("user_1");
    expect(mockPasswordResetRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        tokenHash: "020202",
      })
    );

    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    const body = JSON.parse(requestInit?.body as string);
    // https://resend.com/docs/api-reference/emails/send-email に沿ったペイロードかの厳密な検証
    expect(body).toMatchObject({
      from: "Simple Markdown Note <noreply@simplemarkdown.app>",
      to: "test@example.com",
      subject: "Reset your password",
      html: "<p>test</p>",
      text: "test",
      tags: [
        { name: "category", value: "reset_password" },
        { name: "env", value: "test" },
      ],
    });
    const headers = new Headers(requestInit?.headers);
    expect(headers.get("Authorization")).toBe("Bearer re_test");
  });

  // ユーザーが存在しない場合でもエラーを投げず、安全に終了することを確認する
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

  // RESEND_API_KEYが未設定の場合は警告ログが出力されることを確認する
  it("should warn if RESEND_API_KEY is not set", async () => {
    const mockEnv = {
      DB: {},
      JWT_SECRET: "secret",
    } as unknown as AppEnv["Bindings"];
    mockUserRepo.findByEmail.mockResolvedValue({
      id: "user_1",
      email: "test@example.com",
    });

    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    await requestPasswordReset(db, "test@example.com", mockEnv);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "RESEND_API_KEY is not set. Email will not be sent."
    );
    consoleWarnSpy.mockRestore();
  });

  // メール送信サービス側のエラーを適切にハンドルすることを確認する
  it("should handle Resend API error", async () => {
    const mockEnv = {
      RESEND_API_KEY: "re_test",
      DB: {},
      JWT_SECRET: "secret",
    } as unknown as AppEnv["Bindings"];
    mockUserRepo.findByEmail.mockResolvedValue({
      id: "user_1",
      email: "test@example.com",
    });

    fetchMock.mockResponseOnce(JSON.stringify({ message: "Resend failed" }), {
      status: 400,
    });

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await requestPasswordReset(db, "test@example.com", mockEnv);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
