import {
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getUserById } from "./get-user-by-id";

vi.mock("@simple-markdown-note/database", () => ({
  bcryptjs: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
  createUserRepository: vi.fn(),
  createPasswordResetRepository: vi.fn(),
  createEmailVerificationRepository: vi.fn(),
}));

describe("getUserById", () => {
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
