import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../client";
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
} from "./notesRequests";

const createApiMock = () => ({
  notes: {
    $get: vi.fn(),
    $post: vi.fn(),
    ":id": {
      $get: vi.fn(),
      $patch: vi.fn(),
      $delete: vi.fn(),
    },
  },
});

describe("notesRequests", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  describe("listNotes", () => {
    it("should return NoteListResponse on success", async () => {
      const mockResponse = {
        ok: true,
        json: async () => [{ id: "1", content: "Note 1" }],
      };
      apiMock.notes.$get.mockResolvedValue(mockResponse);

      const result = await listNotes(apiMock as unknown as ApiClient, {
        scope: "all",
      });

      expect(result).toHaveLength(1);
      expect(result[0].content).toBe("Note 1");
    });
  });

  describe("getNote", () => {
    it("should return Note on success", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: "123", title: "My Note" }),
      };
      apiMock.notes[":id"].$get.mockResolvedValue(mockResponse);

      const result = await getNote(apiMock as unknown as ApiClient, "123");

      expect(result.id).toBe("123");
    });
  });

  describe("createNote", () => {
    it("should return created Note on success", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: "new", content: "hello" }),
      };
      apiMock.notes.$post.mockResolvedValue(mockResponse);

      const result = await createNote(apiMock as unknown as ApiClient, {
        content: "hello",
        isPermanent: false,
      });

      expect(result.id).toBe("new");
    });
  });

  describe("updateNote", () => {
    it("should return updated Note on success", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: "123", content: "updated" }),
      };
      apiMock.notes[":id"].$patch.mockResolvedValue(mockResponse);

      const result = await updateNote(apiMock as unknown as ApiClient, "123", {
        content: "updated",
      });

      expect(result.content).toBe("updated");
    });
  });

  describe("deleteNote", () => {
    it("should succeed on 200/204", async () => {
      const mockResponse = {
        ok: true,
      };
      apiMock.notes[":id"].$delete.mockResolvedValue(mockResponse);

      await expect(
        deleteNote(apiMock as unknown as ApiClient, "123")
      ).resolves.not.toThrow();
    });
  });
});
