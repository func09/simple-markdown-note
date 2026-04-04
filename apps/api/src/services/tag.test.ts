import {
  createTagRepository,
  type DrizzleDB,
  type Tag,
} from "@simple-markdown-note/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTag, getTagsWithNoteCount, syncTags } from "./tag";

vi.mock("@simple-markdown-note/database", () => ({
  createTagRepository: vi.fn(),
}));

describe("tag service", () => {
  const db = {} as DrizzleDB;
  const mockTagRepo = {
    findByUserIdAndName: vi.fn(),
    upsert: vi.fn(),
    unlinkAllFromNote: vi.fn(),
    linkToNote: vi.fn(),
    findAllWithNotesByUserId: vi.fn(),
    deleteOrphaned: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createTagRepository).mockReturnValue(
      mockTagRepo as unknown as ReturnType<typeof createTagRepository>
    );
  });

  describe("syncTags", () => {
    const userId = "user1";
    const noteId = "note1";

    it("should create new tags and link them", async () => {
      const newTagNames = ["tag1", "tag2"];

      mockTagRepo.upsert.mockImplementation(
        async ({ name }: { name: string }) =>
          ({
            id: `id_${name}`,
            name,
          }) as Tag
      );

      await syncTags(userId, noteId, newTagNames, db);

      expect(mockTagRepo.unlinkAllFromNote).toHaveBeenCalledWith(noteId);
      expect(mockTagRepo.upsert).toHaveBeenCalledTimes(2);
      expect(mockTagRepo.linkToNote).toHaveBeenCalledWith(noteId, [
        "id_tag1",
        "id_tag2",
      ]);
    });

    it("should handle empty tag list", async () => {
      const newTagNames: string[] = [];

      await syncTags(userId, noteId, newTagNames, db);

      expect(mockTagRepo.unlinkAllFromNote).toHaveBeenCalledWith(noteId);
      expect(mockTagRepo.linkToNote).not.toHaveBeenCalled();
    });

    it("should normalize tag names (trim only)", async () => {
      const newTagNames = ["  tag1  ", "tag1"];

      mockTagRepo.upsert.mockResolvedValue({
        id: "tag1_id",
        name: "tag1",
      } as Tag);

      await syncTags(userId, noteId, newTagNames, db);

      expect(mockTagRepo.upsert).toHaveBeenCalledTimes(1);
      expect(mockTagRepo.upsert).toHaveBeenCalledWith({
        name: "tag1",
        userId,
      });
    });
  });

  describe("getTagsWithNoteCount", () => {
    it("should format raw tags from repository", async () => {
      const mockRawTags = [
        {
          id: "t1",
          name: "tag1",
          updatedAt: new Date(),
          notesToTags: [{}, {}], // 2 notes
        },
      ];
      mockTagRepo.findAllWithNotesByUserId.mockResolvedValue(
        mockRawTags as unknown as Awaited<
          ReturnType<
            ReturnType<typeof createTagRepository>["findAllWithNotesByUserId"]
          >
        >
      );

      const result = await getTagsWithNoteCount("user1", db);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "t1",
        name: "tag1",
        count: 2,
      });
    });
  });

  describe("createTag", () => {
    it("should call upsert on repository", async () => {
      mockTagRepo.upsert.mockResolvedValue({ id: "t1", name: "tag1" } as Tag);

      const result = await createTag("user1", "tag1", db);

      expect(mockTagRepo.upsert).toHaveBeenCalledWith({
        userId: "user1",
        name: "tag1",
      });
      expect(result).toEqual({ id: "t1", name: "tag1" });
    });
  });
});
