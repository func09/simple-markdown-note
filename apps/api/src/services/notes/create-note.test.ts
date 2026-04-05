import {
  createNoteRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { syncTags } from "../tags";
import { createNote } from "./create-note";

vi.mock("@simple-markdown-note/database", () => ({
  createNoteRepository: vi.fn(),
}));

vi.mock("../tags", () => ({
  syncTags: vi.fn(),
}));

describe("createNote", () => {
  const db = {} as DrizzleDB;
  const mockNoteRepo = {
    create: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createNoteRepository).mockReturnValue(
      mockNoteRepo as unknown as ReturnType<typeof createNoteRepository>
    );
  });

  it("should create a note and sync tags", async () => {
    const mockNote = { id: "n1", content: "new note" };
    mockNoteRepo.create.mockResolvedValue(mockNote);
    vi.mocked(syncTags).mockResolvedValue([
      { id: "t1", name: "tag1" },
    ] as Awaited<ReturnType<typeof syncTags>>);

    const result = await createNote(
      "user1",
      { content: "new note", tags: ["tag1"] },
      db
    );

    expect(mockNoteRepo.create).toHaveBeenCalledWith({
      userId: "user1",
      content: "new note",
      isPermanent: undefined,
    });
    expect(syncTags).toHaveBeenCalledWith("user1", "n1", ["tag1"], db);
    expect(result).toEqual({
      ...mockNote,
      tags: [{ id: "t1", name: "tag1" }],
    });
  });
});
