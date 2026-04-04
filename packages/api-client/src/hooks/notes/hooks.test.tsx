import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { Note, NoteListResponse } from "common/schemas";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiClient } from "@/client";
import { ApiProvider } from "@/context";
import * as notesRequests from "@/requests/notesRequests";
import {
  useCreateNote,
  useDeleteNote,
  useNote,
  useNotes,
  usePermanentDelete,
  useRestoreNote,
  useUpdateNote,
} from "./hooks";

vi.mock("@/requests/notesRequests");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ApiProvider client={{} as ApiClient}>{children}</ApiProvider>
    </QueryClientProvider>
  );
};

describe("notesQueries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useNotes", () => {
    it("should return notes list", async () => {
      const mockData = [{ id: "1", content: "note" }];
      vi.mocked(notesRequests.listNotes).mockResolvedValue(
        mockData as unknown as NoteListResponse
      );

      const { result } = renderHook(() => useNotes({ scope: "all" }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe("useNote", () => {
    it("should return a single note", async () => {
      const mockData = { id: "1", content: "note" };
      vi.mocked(notesRequests.getNote).mockResolvedValue(
        mockData as unknown as Note
      );

      const { result } = renderHook(() => useNote("1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });

    it("should not fetch when id is null", () => {
      const { result } = renderHook(() => useNote(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(notesRequests.getNote).not.toHaveBeenCalled();
    });
  });

  describe("useCreateNote", () => {
    it("should call createNote and invalidate queries", async () => {
      const mockData = { id: "new", content: "hello" };
      vi.mocked(notesRequests.createNote).mockResolvedValue(
        mockData as unknown as Note
      );

      const { result } = renderHook(() => useCreateNote(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ content: "hello", isPermanent: false });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(notesRequests.createNote).toHaveBeenCalled();
    });
  });

  describe("useUpdateNote", () => {
    it("should call updateNote", async () => {
      const mockData = { id: "1", content: "updated" };
      vi.mocked(notesRequests.updateNote).mockResolvedValue(
        mockData as unknown as Note
      );

      const { result } = renderHook(() => useUpdateNote(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: "1", data: { content: "updated" } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(notesRequests.updateNote).toHaveBeenCalledWith(
        expect.anything(),
        "1",
        { content: "updated" }
      );
    });
  });

  describe("useDeleteNote", () => {
    it("should call updateNote with deletedAt", async () => {
      const mockData = { id: "1", deletedAt: "2026-01-01T00:00:00.000Z" };
      vi.mocked(notesRequests.updateNote).mockResolvedValue(
        mockData as unknown as Note
      );

      const { result } = renderHook(() => useDeleteNote(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(notesRequests.updateNote).toHaveBeenCalledWith(
        expect.anything(),
        "1",
        expect.objectContaining({ deletedAt: expect.any(String) })
      );
    });
  });

  describe("useRestoreNote", () => {
    it("should call updateNote with deletedAt null", async () => {
      const mockData = { id: "1", deletedAt: null };
      vi.mocked(notesRequests.updateNote).mockResolvedValue(
        mockData as unknown as Note
      );

      const { result } = renderHook(() => useRestoreNote(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(notesRequests.updateNote).toHaveBeenCalledWith(
        expect.anything(),
        "1",
        { deletedAt: null }
      );
    });
  });

  describe("usePermanentDelete", () => {
    it("should call deleteNote", async () => {
      vi.mocked(notesRequests.deleteNote).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePermanentDelete(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(notesRequests.deleteNote).toHaveBeenCalledWith(
        expect.anything(),
        "1"
      );
    });
  });
});
