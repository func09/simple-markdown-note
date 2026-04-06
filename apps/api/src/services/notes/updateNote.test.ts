import {
  createNoteRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { syncTags } from "../tags";
import { updateNote } from "./updateNote";

vi.mock("@simple-markdown-note/database", () => ({
  createNoteRepository: vi.fn(),
}));

vi.mock("../tags", () => ({
  syncTags: vi.fn(),
}));

describe("updateNote", () => {
  const db = {} as DrizzleDB;
  const mockNoteRepo = {
    update: vi.fn(),
    findByIdWithTags: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createNoteRepository).mockReturnValue(
      mockNoteRepo as unknown as ReturnType<typeof createNoteRepository>
    );
  });

  it("should update a note and sync tags", async () => {
    const updatedNote = {
      id: "n1",
      content: "new",
      notesToTags: [{ tag: { id: "t1", name: "tag1" } }],
    };
    // update 後に getNoteById が呼ばれる
    mockNoteRepo.findByIdWithTags.mockResolvedValue(updatedNote);

    const result = await updateNote(
      "user1",
      "n1",
      { content: "new", tags: ["tag1"] },
      db
    );

    expect(mockNoteRepo.update).toHaveBeenCalledWith("n1", "user1", {
      content: "new",
      isPermanent: undefined,
      deletedAt: undefined,
    });
    expect(syncTags).toHaveBeenCalledWith("user1", "n1", ["tag1"], db);
    expect(result?.tags).toHaveLength(1);
  });
});
