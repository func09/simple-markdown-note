import {
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { HTTPException } from "hono/http-exception";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dropUser } from "./drop-user";

vi.mock("@simple-markdown-note/database", () => ({
  bcryptjs: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
  createUserRepository: vi.fn(),
}));

describe("dropUser", () => {
  const db = {} as DrizzleDB;
  const mockUserRepo = {
    findById: vi.fn(),
    updateStatus: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createUserRepository).mockReturnValue(
      mockUserRepo as unknown as ReturnType<typeof createUserRepository>
    );
  });

  it("should drop user by updating status to deleted", async () => {
    mockUserRepo.findById.mockResolvedValue({
      id: "1",
      email: "test@example.com",
    });

    await dropUser(db, "1");

    expect(mockUserRepo.findById).toHaveBeenCalledWith("1");
    expect(mockUserRepo.updateStatus).toHaveBeenCalledWith("1", "deleted");
  });

  it("should throw HTTPException if user is not found", async () => {
    mockUserRepo.findById.mockResolvedValue(undefined);

    await expect(dropUser(db, "2")).rejects.toThrow(HTTPException);
    await expect(dropUser(db, "2")).rejects.toThrow("User not found");

    expect(mockUserRepo.findById).toHaveBeenCalledWith("2");
    expect(mockUserRepo.updateStatus).not.toHaveBeenCalled();
  });
});
