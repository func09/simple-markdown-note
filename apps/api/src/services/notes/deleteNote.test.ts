import {
  createNoteRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteNote } from "./deleteNote";

vi.mock("@simple-markdown-note/database", () => ({
  createNoteRepository: vi.fn(),
}));

// ノート削除処理のテストスイート
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

  // ノートが削除（論理削除）されることを確認する
  it("should delete a note", async () => {
    await deleteNote("user1", "n1", db);

    expect(mockNoteRepo.delete).toHaveBeenCalledWith("n1", "user1");
  });
});
