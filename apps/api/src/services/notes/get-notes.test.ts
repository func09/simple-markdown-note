import {
  createNoteRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNotes } from "./get-notes";

vi.mock("@simple-markdown-note/database", () => ({
  createNoteRepository: vi.fn(),
}));

describe("getNotes", () => {
  const db = {} as DrizzleDB;
  const mockNoteRepo = {
    findAllByUserIdWithFilters: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createNoteRepository).mockReturnValue(
      mockNoteRepo as unknown as ReturnType<typeof createNoteRepository>
    );
  });

  it("should return notes for a user", async () => {
    mockNoteRepo.findAllByUserIdWithFilters.mockResolvedValue([
      { id: "n1", content: "note1", notesToTags: [] },
    ]);

    const result = await getNotes("user1", db);

    expect(mockNoteRepo.findAllByUserIdWithFilters).toHaveBeenCalledWith(
      "user1",
      {}
    );
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe("note1");
  });
});
