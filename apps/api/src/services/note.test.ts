import {
  createNoteRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote,
} from "./note";
import * as tagService from "./tag";

vi.mock("@simple-markdown-note/database", () => ({
  createNoteRepository: vi.fn(),
}));

vi.mock("./tag", () => ({
  syncTags: vi.fn(),
  cleanupOrphanedTags: vi.fn(),
}));

describe("note service", () => {
  const db = {} as DrizzleDB;
  const mockNoteRepo = {
    findAllByUserIdWithFilters: vi.fn(),
    findByIdWithTags: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createNoteRepository).mockReturnValue(
      mockNoteRepo as unknown as ReturnType<typeof createNoteRepository>
    );
  });

  describe("getNotes", () => {
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

  describe("getNoteById", () => {
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

  describe("createNote", () => {
    it("should create a note and sync tags", async () => {
      const mockNote = { id: "n1", content: "new note" };
      mockNoteRepo.create.mockResolvedValue(mockNote);
      vi.mocked(tagService.syncTags).mockResolvedValue([
        { id: "t1", name: "tag1" },
      ] as Awaited<ReturnType<typeof tagService.syncTags>>);

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
      expect(tagService.syncTags).toHaveBeenCalledWith(
        "user1",
        "n1",
        ["tag1"],
        db
      );
      expect(result).toEqual({
        ...mockNote,
        tags: [{ id: "t1", name: "tag1" }],
      });
    });
  });

  describe("updateNote", () => {
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
      expect(tagService.syncTags).toHaveBeenCalledWith(
        "user1",
        "n1",
        ["tag1"],
        db
      );
      expect(result?.tags).toHaveLength(1);
    });
  });

  describe("deleteNote", () => {
    it("should delete a note", async () => {
      await deleteNote("user1", "n1", db);

      expect(mockNoteRepo.delete).toHaveBeenCalledWith("n1", "user1");
    });
  });
});
