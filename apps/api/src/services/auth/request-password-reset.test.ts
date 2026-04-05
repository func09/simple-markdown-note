import type { AppEnv } from "@simple-markdown-note/api/types";
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
import { requestPasswordReset } from "./request-password-reset";

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

    expect(mockPasswordResetRepo.deleteByUserId).toHaveBeenCalledWith("user_1");
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
