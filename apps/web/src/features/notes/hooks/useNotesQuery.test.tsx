import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { Note, TagListItem } from "api";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as noteApi from "@/features/notes/api";
import {
  useCreateNote,
  useDeleteNote,
  useEmptyTrash,
  useNotes,
  usePermanentDeleteNote,
  useTags,
  useUpdateNote,
} from "@/features/notes/hooks/useNotesQuery";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    notes: {
      put: vi.fn(),
      bulkPut: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      toArray: vi.fn(),
      filter: vi.fn().mockReturnValue({ toArray: vi.fn() }),
    },
    transaction: vi.fn((_mode, _tables, cb) => cb()),
  },
}));

vi.mock("@/features/notes/api", () => ({
  fetchNotes: vi.fn(),
  fetchTags: vi.fn(),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

function renderWithClient<T>(hook: () => T) {
  const testQueryClient = createTestQueryClient();
  const { result, unmount } = renderHook(hook, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    ),
  });
  return { result, unmount, queryClient: testQueryClient };
}

describe("useNotesQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useNotes", () => {
    it("should fetch notes from api and save to dexie", async () => {
      const mockNotes: Note[] = [
        {
          id: "1",
          content: "Note 1",
          tags: [],
          userId: "u1",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          isPermanent: false,
        },
      ];
      vi.mocked(noteApi.fetchNotes).mockResolvedValue(mockNotes);
      const { result } = renderWithClient(() => useNotes({ scope: "all" }));

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(noteApi.fetchNotes).toHaveBeenCalledWith({ scope: "all" });
      expect(db.notes.bulkPut).toHaveBeenCalledWith(mockNotes);
      expect(result.current.data).toEqual(mockNotes);
    });

    it("should fallback to dexie on api error", async () => {
      vi.mocked(noteApi.fetchNotes).mockRejectedValue(new Error("API Error"));
      const mockDexieNotes: Note[] = [
        {
          id: "1",
          content: "Note 1",
          tags: [],
          userId: "u1",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          isPermanent: false,
        },
        {
          id: "2",
          content: "Note 2",
          tags: [],
          userId: "u1",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: new Date(),
          isPermanent: false,
        },
      ];
      vi.mocked(db.notes.toArray).mockResolvedValue(mockDexieNotes);

      const { result } = renderWithClient(() => useNotes({ scope: "all" }));

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].id).toBe("1");
    });
  });

  describe("useTags", () => {
    it("should fetch tags from api", async () => {
      const mockTags: TagListItem[] = [
        { id: "1", name: "Work", updatedAt: new Date(), count: 5 },
      ];
      vi.mocked(noteApi.fetchTags).mockResolvedValue(mockTags);
      const { result } = renderWithClient(() => useTags());

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([
        { id: "1", name: "Work", updatedAt: expect.any(Date), count: 5 },
      ]);
    });
  });

  describe("useCreateNote", () => {
    it("should call api and update dexie", async () => {
      const newNote: Note = {
        id: "new-1",
        content: "Hello",
        userId: "u1",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isPermanent: false,
      };
      vi.mocked(noteApi.createNote).mockResolvedValue(newNote);

      const { result } = renderWithClient(() => useCreateNote());

      await result.current.mutateAsync({ content: "Hello", tags: [] });

      expect(noteApi.createNote).toHaveBeenCalled();
      expect(db.notes.put).toHaveBeenCalledWith(newNote);
    });
  });

  describe("useUpdateNote", () => {
    it("should call api and update dexie", async () => {
      const updatedNote: Note = {
        id: "1",
        content: "Updated",
        userId: "u1",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isPermanent: false,
      };
      vi.mocked(noteApi.updateNote).mockResolvedValue(updatedNote);

      const { result } = renderWithClient(() => useUpdateNote());

      await result.current.mutateAsync({
        id: "1",
        data: { content: "Updated" },
      });

      expect(noteApi.updateNote).toHaveBeenCalledWith("1", {
        content: "Updated",
        tags: undefined,
      });
      expect(db.notes.put).toHaveBeenCalledWith(updatedNote);
    });
  });

  describe("useDeleteNote", () => {
    it("should call api with deletedAt and update dexie", async () => {
      const deletedNote: Note = {
        id: "1",
        content: "Note 1",
        userId: "u1",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        isPermanent: false,
      };
      vi.mocked(noteApi.updateNote).mockResolvedValue(deletedNote);

      const { result } = renderWithClient(() => useDeleteNote());

      await result.current.mutateAsync("1");

      expect(noteApi.updateNote).toHaveBeenCalledWith("1", {
        deletedAt: expect.any(String),
      });
      expect(db.notes.put).toHaveBeenCalledWith(deletedNote);
    });
  });

  describe("usePermanentDeleteNote", () => {
    it("should call delete api and remove from dexie", async () => {
      const { result } = renderWithClient(() => usePermanentDeleteNote());

      await result.current.mutateAsync("1");

      expect(noteApi.deleteNote).toHaveBeenCalledWith("1");
      expect(db.notes.delete).toHaveBeenCalledWith("1");
    });
  });

  describe("useEmptyTrash", () => {
    it("should delete all trash notes from api and dexie", async () => {
      vi.mocked(db.notes.filter).mockReturnValue({
        toArray: vi
          .fn()
          .mockResolvedValue([{ id: "trash-1" }, { id: "trash-2" }]),
        // biome-ignore lint/suspicious/noExplicitAny: mock
      } as any);

      const { result } = renderWithClient(() => useEmptyTrash());

      await result.current.mutateAsync();

      expect(noteApi.deleteNote).toHaveBeenCalledTimes(2);
      expect(db.notes.delete).toHaveBeenCalledWith("trash-1");
      expect(db.notes.delete).toHaveBeenCalledWith("trash-2");
    });
  });
});
