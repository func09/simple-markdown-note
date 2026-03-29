import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as noteApi from "@/features/notes/api";
import { useSync, useTriggerSync } from "@/features/notes/hooks/useSync";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    notes: {
      where: vi.fn(),
      toArray: vi.fn(),
      bulkDelete: vi.fn(),
      bulkPut: vi.fn(),
    },
    transaction: vi.fn(async (mode, tables, cb) => await cb()),
  },
}));

vi.mock("@/features/notes/api", () => ({
  syncNotes: vi.fn(),
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

describe("useSync / useTriggerSync", () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    vi.clearAllMocks();

    localStorageMock = {};
    const storageSpy = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation((key) => localStorageMock[key] || null);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation((key, val) => {
      localStorageMock[key] = val;
    });

    // Default navigator.onLine mock
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("useSync", () => {
    it("returns offline status if navigator.onLine is false", async () => {
      Object.defineProperty(navigator, "onLine", { value: false });

      const { result } = renderWithClient(() => useSync());
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({
        status: "offline",
        updatesCount: 0,
      });
    });

    it("performs initial sync with all local data if lastSyncedAt is not present", async () => {
      vi.mocked(db.notes.toArray).mockResolvedValue([
        {
          id: "1",
          content: "hello",
          deletedAt: null,
          isPermanent: false,
          updatedAt: "2023-01-01",
        },
      ] as any);

      vi.mocked(noteApi.syncNotes).mockResolvedValue({
        newSyncTime: "2023-01-02T00:00:00Z",
        updates: [],
      });

      const { result } = renderWithClient(() => useSync());

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(db.notes.toArray).toHaveBeenCalled(); // Since there was no lastSyncTime
      expect(noteApi.syncNotes).toHaveBeenCalledWith(
        expect.objectContaining({
          lastSyncedAt: undefined,
          changes: expect.arrayContaining([
            expect.objectContaining({ id: "1" }),
          ]),
        })
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "simplenote_last_sync",
        "2023-01-02T00:00:00Z"
      );
      expect(result.current.data).toEqual({
        status: "success",
        newSyncTime: "2023-01-02T00:00:00Z",
        updatesCount: 0,
      });
    });

    it("syncs only updated items and process server updates", async () => {
      localStorageMock["simplenote_last_sync"] = "2023-01-01T00:00:00Z";

      const toArrayMock = vi.fn().mockResolvedValue([{ id: "changed-1" }]);
      const aboveMock = vi.fn().mockReturnValue({ toArray: toArrayMock });
      vi.mocked(db.notes.where).mockReturnValue({ above: aboveMock } as any);

      vi.mocked(noteApi.syncNotes).mockResolvedValue({
        newSyncTime: "2023-01-02T00:00:00Z",
        updates: [
          { id: "server-1", content: "new", isPermanent: false },
          { id: "deleted-1", isPermanent: true },
        ],
      });

      const { result } = renderWithClient(() => useSync());

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(db.notes.where).toHaveBeenCalledWith("updatedAt");
      expect(aboveMock).toHaveBeenCalledWith("2023-01-01T00:00:00Z");

      expect(db.notes.bulkDelete).toHaveBeenCalledWith(["deleted-1"]);
      expect(db.notes.bulkPut).toHaveBeenCalledWith([
        expect.objectContaining({ id: "server-1" }),
      ]);

      expect(result.current.data?.updatesCount).toBe(2);
    });

    it("handles sync errors gracefully", async () => {
      vi.mocked(db.notes.toArray).mockRejectedValue(new Error("DB Error"));

      const { result } = renderWithClient(() => useSync());

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({ status: "error", updatesCount: 0 });
    });
  });

  describe("useTriggerSync", () => {
    it("invalidates sync queries to trigger background sync", () => {
      const { result, queryClient } = renderWithClient(() => useTriggerSync());
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      result.current();

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["sync"] });
    });
  });
});
