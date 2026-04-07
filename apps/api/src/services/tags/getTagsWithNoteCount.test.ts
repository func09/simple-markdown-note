import {
  createTagRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTagsWithNoteCount } from "./getTagsWithNoteCount";

vi.mock("@simple-markdown-note/database", () => ({
  createTagRepository: vi.fn(),
}));

// 使用ノート数付きのタグ取得処理のテストスイート
describe("getTagsWithNoteCount", () => {
  const db = {} as DrizzleDB;
  const mockTagRepo = {
    findAllWithNotesByUserId: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createTagRepository).mockReturnValue(
      mockTagRepo as unknown as ReturnType<typeof createTagRepository>
    );
  });

  // 格納されている生タグ情報を正しくフォーマットして返すことを確認する
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
