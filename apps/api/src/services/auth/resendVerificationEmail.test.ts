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

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn() },
  })),
}));

vi.mock("@simple-markdown-note/emails", () => ({
  renderVerifyEmail: vi.fn().mockResolvedValue({
    html: "<p>verify</p>",
    text: "verify",
  }),
}));

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

  it("should process resend for pending user", async () => {
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
});
