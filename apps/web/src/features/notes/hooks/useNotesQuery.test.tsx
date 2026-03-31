import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as noteApi from "../../../features/notes/api";
import { db } from "../../../lib/db";
import {
  useCreateNote,
  useDeleteNote,
  useEmptyTrash,
  usePermanentDeleteNote,
  useRestoreNote,
  useTags,
  useUpdateNote,
} from "../../../useNotesQuery";

vi.mock("../lib/db", () => ({
  db: {
    notes: {
      put: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      filter: vi.fn().mockReturnValue({ toArray: vi.fn() }),
    },
    transaction: vi.fn((_mode, _tables, cb) => cb()),
  },
}));

vi.mock("../features/notes/api", () => ({
  fetchTags: vi.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

function renderWithClient<T>(hook: () => T) {
  const testQueryClient = createTestQueryClient();
  const { result, unmount } = renderHook(hook, {
    wrapper: ({ children }) => (
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

  describe("useTags", () => {
    it("should fetch tags from api", async () => {
      vi.mocked(noteApi.fetchTags).mockResolvedValue([
        { id: "1", name: "Work" },
      ] as unknown as Awaited<ReturnType<typeof noteApi.fetchTags>>);
      const { result } = renderWithClient(() => useTags());

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([{ id: "1", name: "Work" }]);
    });
  });

  describe("useCreateNote", () => {
    it("should insert a new note into Dexie DB", async () => {
      const { result } = renderWithClient(() => useCreateNote());

      await result.current.mutateAsync({
        content: "Hello World",
        tags: ["Test"],
      });

      expect(db.notes.put).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "Hello World",
          isPermanent: false,
        })
      );
    });
  });

  describe("useUpdateNote", () => {
    it("should update existing note content and tags", async () => {
      vi.mocked(db.notes.get).mockResolvedValue({
        id: "note-1",
        content: "Old",
        tags: [],
      } as unknown as Awaited<ReturnType<typeof db.notes.get>>);

      const { result } = renderWithClient(() => useUpdateNote());

      await result.current.mutateAsync({
        id: "note-1",
        data: { content: "New content" },
      });

      expect(db.notes.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "note-1",
          content: "New content",
        })
      );
    });
  });

  describe("useDeleteNote", () => {
    it("should perform soft delete by setting deletedAt", async () => {
      const { result } = renderWithClient(() => useDeleteNote());

      await result.current.mutateAsync("note-1");

      expect(db.notes.update).toHaveBeenCalledWith(
        "note-1",
        expect.objectContaining({
          deletedAt: expect.any(String),
        })
      );
    });
  });

  describe("useRestoreNote", () => {
    it("should clear deletedAt", async () => {
      const { result } = renderWithClient(() => useRestoreNote());

      await result.current.mutateAsync("note-1");

      expect(db.notes.update).toHaveBeenCalledWith(
        "note-1",
        expect.objectContaining({
          deletedAt: null,
        })
      );
    });
  });

  describe("usePermanentDeleteNote", () => {
    it("should set isPermanent to true for later unified sync deletion", async () => {
      const { result } = renderWithClient(() => usePermanentDeleteNote());

      await result.current.mutateAsync("note-1");

      expect(db.notes.update).toHaveBeenCalledWith(
        "note-1",
        expect.objectContaining({
          isPermanent: true,
          deletedAt: expect.any(String),
        })
      );
    });
  });

  describe("useEmptyTrash", () => {
    it("should set all deleted notes to isPermanent=true", async () => {
      vi.mocked(db.notes.filter).mockReturnValue({
        toArray: vi
          .fn()
          .mockResolvedValue([{ id: "trash-1" }, { id: "trash-2" }]),
      } as unknown as ReturnType<typeof db.notes.filter>);

      const { result } = renderWithClient(() => useEmptyTrash());

      await result.current.mutateAsync();

      expect(db.notes.update).toHaveBeenCalledWith(
        "trash-1",
        expect.objectContaining({ isPermanent: true })
      );
      expect(db.notes.update).toHaveBeenCalledWith(
        "trash-2",
        expect.objectContaining({ isPermanent: true })
      );
    });
  });
});
