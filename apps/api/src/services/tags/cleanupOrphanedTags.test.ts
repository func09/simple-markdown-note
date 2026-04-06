import {
  createTagRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanupOrphanedTags } from "./cleanupOrphanedTags";

vi.mock("@simple-markdown-note/database", () => ({
  createTagRepository: vi.fn(),
}));

describe("cleanupOrphanedTags", () => {
  const db = {} as DrizzleDB;
  const mockTagRepo = {
    deleteOrphaned: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createTagRepository).mockReturnValue(
      mockTagRepo as unknown as ReturnType<typeof createTagRepository>
    );
  });

  it("should call deleteOrphaned on repository", async () => {
    await cleanupOrphanedTags("user1", db);

    expect(mockTagRepo.deleteOrphaned).toHaveBeenCalledWith("user1");
  });
});
