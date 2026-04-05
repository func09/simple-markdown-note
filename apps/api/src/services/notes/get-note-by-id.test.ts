import {
  createNoteRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNoteById } from "./get-note-by-id";

vi.mock("@simple-markdown-note/database", () => ({
  createNoteRepository: vi.fn(),
}));

describe("getNoteById", () => {
  const db = {} as DrizzleDB;
  const mockNoteRepo = {
    findByIdWithTags: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createNoteRepository).mockReturnValue(
      mockNoteRepo as unknown as ReturnType<typeof createNoteRepository>
    );
  });

  it("should return a single note", async () => {
    mockNoteRepo.findByIdWithTags.mockResolvedValue({
      id: "n1",
      content: "note1",
      notesToTags: [],
    });

    const result = await getNoteById("user1", "n1", db);

    expect(mockNoteRepo.findByIdWithTags).toHaveBeenCalledWith("n1", "user1");
    expect(result?.content).toBe("note1");
  });
});
