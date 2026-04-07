import {
  createTagRepository,
  type DrizzleDB,
  type Tag,
} from "@simple-markdown-note/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTag } from "./createTag";

vi.mock("@simple-markdown-note/database", () => ({
  createTagRepository: vi.fn(),
}));

// タグ作成処理のテストスイート
describe("createTag", () => {
  const db = {} as DrizzleDB;
  const mockTagRepo = {
    upsert: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createTagRepository).mockReturnValue(
      mockTagRepo as unknown as ReturnType<typeof createTagRepository>
    );
  });

  // タグリポジトリのupsert（登録・更新）メソッドが呼び出されることを確認する
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
