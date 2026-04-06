import {
  createNoteRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteNote } from "./deleteNote";

vi.mock("@simple-markdown-note/database", () => ({
  createNoteRepository: vi.fn(),
}));

describe("deleteNote", () => {
  const db = {} as DrizzleDB;
  const mockNoteRepo = {
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createNoteRepository).mockReturnValue(
      mockNoteRepo as unknown as ReturnType<typeof createNoteRepository>
    );
  });

  it("should delete a note", async () => {
    await deleteNote("user1", "n1", db);

    expect(mockNoteRepo.delete).toHaveBeenCalledWith("n1", "user1");
  });
});
