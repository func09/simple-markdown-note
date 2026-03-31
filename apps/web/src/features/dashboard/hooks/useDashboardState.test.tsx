import type { UseQueryResult } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { Note } from "api";
import type React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as useDashboardActionsHook from "@/features/dashboard/hooks/useDashboardActions";
import { useDashboardState } from "@/features/dashboard/hooks/useDashboardState";
import { useDashboardStore } from "@/features/dashboard/stores";
import * as hooks from "@/features/notes/hooks";

vi.mock("@/features/notes/hooks", () => ({
  useNotes: vi.fn(),
  useOramaSearch: vi.fn(),
}));
vi.mock("./useDashboardActions");
vi.mock("@/hooks/useMediaQuery", () => ({
  useMediaQuery: vi.fn().mockReturnValue(false),
}));

const setupStores = (
  dashboardState: {
    searchQuery?: string;
    activeView?: "list" | "editor";
    isSidebarOpen?: boolean;
  } = {}
) => {
  useDashboardStore.setState({
    searchQuery: "",
    activeView: "list",
    isSidebarOpen: false,
    ...dashboardState,
  });
};

const renderWithRouter = (
  ui: () => ReturnType<typeof useDashboardState>,
  initialEntries = ["/notes/all"]
) => {
  return renderHook(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/notes/:filter/:noteId?" element={children} />
          <Route path="/tags/:tagName/:noteId?" element={children} />
        </Routes>
      </MemoryRouter>
    ),
  });
};

describe("useDashboardState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupStores();

    // Mock useNotes
    const mockNotes: Note[] = [
      {
        id: "1",
        content: "note 1",
        userId: "u1",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isPermanent: false,
      },
      {
        id: "2",
        content: "note 2",
        userId: "u1",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isPermanent: false,
      },
    ];

    vi.mocked(hooks.useNotes).mockReturnValue({
      data: mockNotes,
      isLoading: false,
    } as unknown as UseQueryResult<Note[], Error>);

    // Mock useOramaSearch
    vi.mocked(hooks.useOramaSearch).mockReturnValue({
      filteredNotes: [mockNotes[0]],
      searchNotes: vi.fn().mockReturnValue([mockNotes[0]]),
      oramaDb: {} as unknown as ReturnType<
        typeof hooks.useOramaSearch
      >["oramaDb"],
    });

    // Mock useDashboardActions
    vi.mocked(useDashboardActionsHook.useDashboardActions).mockReturnValue({
      handleCreateNote: vi.fn(),
      handleDeleteClick: vi.fn(),
      handleEmptyTrash: vi.fn(),
    } as unknown as ReturnType<
      typeof useDashboardActionsHook.useDashboardActions
    >);
  });

  it("calls useNotes with correct parameters for 'all' scope", () => {
    renderWithRouter(() => useDashboardState(), ["/notes/all"]);

    expect(hooks.useNotes).toHaveBeenCalledWith({
      tag: undefined,
      scope: "all",
    });
  });

  it("calls useNotes with correct parameters for tags", () => {
    renderWithRouter(() => useDashboardState(), ["/tags/React"]);

    expect(hooks.useNotes).toHaveBeenCalledWith({
      tag: "React",
      scope: "all",
    });
  });

  it("calls useNotes with correct parameters for trash", () => {
    renderWithRouter(() => useDashboardState(), ["/notes/trash"]);

    expect(hooks.useNotes).toHaveBeenCalledWith({
      tag: undefined,
      scope: "trash",
    });
  });

  it("updates selection and navigates correctly", () => {
    const { result } = renderWithRouter(
      () => useDashboardState(),
      ["/notes/all"]
    );

    act(() => {
      result.current.updateSelection("Work", false, "test");
    });

    const dState = useDashboardStore.getState();
    expect(dState.searchQuery).toBe("test");
  });

  it("returns correct selectedNote based on noteId", () => {
    const { result } = renderWithRouter(
      () => useDashboardState(),
      ["/notes/all/1"]
    );

    expect(result.current.selectedNote?.id).toBe("1");
    expect(result.current.selectedNoteId).toBe("1");
  });
});
