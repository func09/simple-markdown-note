import {
  createEmailVerificationRepository,
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
import { resendVerificationEmail } from "./resendVerificationEmail";

vi.mock("@simple-markdown-note/database", () => ({
  createUserRepository: vi.fn(),
  createEmailVerificationRepository: vi.fn(),
}));

vi.mock("@simple-markdown-note/emails", () => ({
  renderVerifyEmail: vi.fn().mockResolvedValue({
    html: "<p>verify</p>",
    text: "verify",
  }),
}));

// 検証メール再送処理のテストスイート
describe("resendVerificationEmail", () => {
  const db = {} as DrizzleDB;
  const mockUserRepo = {
    findByEmail: vi.fn(),
  };
  const mockVerifyRepo = {
    create: vi.fn(),
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

  beforeAll(() => {
    vi.spyOn(globalThis.crypto, "getRandomValues").mockImplementation(
      (arr: unknown) => {
        (arr as Uint8Array).fill(1);
        return arr as Uint8Array;
      }
    );
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  // アカウント保留中のユーザーに対しては正常に確認メールが再送されることを確認する
  it("should process resend for pending user", async () => {
    const mockEnv = {
      RESEND_API_KEY: "re_test",
      DB: {},
      JWT_SECRET: "secret",
      NODE_ENV: "test",
    } as unknown as AppEnv["Bindings"];
    mockUserRepo.findByEmail.mockResolvedValue({
      id: "user_1",
      email: "test@example.com",
      status: "pending",
    });

    fetchMock.mockResponseOnce(JSON.stringify({ id: "test-id" }));

    await resendVerificationEmail(db, "test@example.com", mockEnv);

    expect(mockVerifyRepo.deleteByUserId).toHaveBeenCalledWith("user_1");
    // getRandomValues fill with 1 -> 32 bytes gives 64 exactly matching `01`s
    const hexRep = "01".repeat(32);
    expect(mockVerifyRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        token: hexRep,
      })
    );

    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    const body = JSON.parse(requestInit?.body as string);
    // https://resend.com/docs/api-reference/emails/send-email に沿ったペイロードかの厳密な検証
    expect(body).toMatchObject({
      from: "Simple Markdown Note <noreply@simplemarkdown.app>",
      to: "test@example.com",
      subject: "Verify your email address",
      html: "<p>verify</p>",
      text: "verify",
      tags: [
        { name: "category", value: "verify_email" },
        { name: "env", value: "test" },
      ],
    });
    const headers = new Headers(requestInit?.headers);
    expect(headers.get("Authorization")).toBe("Bearer re_test");
  });

  // すでに有効化済みのユーザーに対しては何もしないことを確認する
  it("should do nothing if user is already active", async () => {
    const mockEnv = {
      RESEND_API_KEY: "re_test",
      DB: {},
      JWT_SECRET: "secret",
    } as unknown as AppEnv["Bindings"];
    mockUserRepo.findByEmail.mockResolvedValue({
      id: "user_1",
      email: "test@example.com",
      status: "active",
    });

    await resendVerificationEmail(db, "test@example.com", mockEnv);

    expect(mockVerifyRepo.deleteByUserId).not.toHaveBeenCalled();
    expect(mockVerifyRepo.create).not.toHaveBeenCalled();
  });

  // ユーザーが存在しない場合でもエラーを投げず、安全に終了することを確認する
  it("should fail gracefully if user doesn't exist", async () => {
    const mockEnv = {
      RESEND_API_KEY: "re_test",
      DB: {},
      JWT_SECRET: "secret",
    } as unknown as AppEnv["Bindings"];
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await resendVerificationEmail(db, "unknown@example.com", mockEnv);

    expect(mockVerifyRepo.deleteByUserId).not.toHaveBeenCalled();
    expect(mockVerifyRepo.create).not.toHaveBeenCalled();
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
      status: "pending",
    });

    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    await resendVerificationEmail(db, "test@example.com", mockEnv);

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
      status: "pending",
    });

    fetchMock.mockResponseOnce(JSON.stringify({ message: "Resend failed" }), {
      status: 400,
    });

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await resendVerificationEmail(db, "test@example.com", mockEnv);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
