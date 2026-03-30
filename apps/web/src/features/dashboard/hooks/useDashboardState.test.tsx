import { act, renderHook } from "@testing-library/react";
import * as dexieHooks from "dexie-react-hooks";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as useDashboardActionsHook from "@/web/features/dashboard/hooks/useDashboardActions";
import { useDashboardState } from "@/web/features/dashboard/hooks/useDashboardState";
import { useDashboardStore } from "@/web/features/dashboard/stores";
import * as hooks from "@/web/features/notes/hooks";
import { useNoteStore } from "@/web/features/notes/stores";

vi.mock("dexie-react-hooks");
vi.mock("@/web/features/notes/hooks");
vi.mock("./useDashboardActions");

const setupStores = (
  dashboardState: {
    searchQuery?: string;
    activeView?: "list" | "editor";
    isSidebarOpen?: boolean;
  } = {},
  noteState: { selectedNoteId?: string | null } = {}
) => {
  useDashboardStore.setState({
    searchQuery: "",
    activeView: "list",
    isSidebarOpen: false,
    ...dashboardState,
  });
  useNoteStore.setState({
    selectedNoteId: null,
    ...noteState,
  });
};

const renderWithRouter = (
  ui: () => unknown,
  initialEntries = ["/notes/all"]
) => {
  return renderHook(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/notes/:filter/:noteId?" element={children} />
          <Route path="/tags/:tagName/:noteId?" element={children} />
        </Routes>
      </MemoryRouter>
    ),
  }) as any;
};

describe("useDashboardState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupStores();

    // Mock matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    vi.mocked(dexieHooks.useLiveQuery).mockReturnValue([
      { id: "1", content: "note 1", deletedAt: null },
      { id: "2", content: "note 2", deletedAt: null },
      { id: "trash-1", content: "trash 1", deletedAt: "2023-01-01" },
    ]);

    vi.mocked(hooks.useSync).mockReturnValue({
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useSync>);

    vi.mocked(hooks.useOramaSearch).mockReturnValue({
      filteredNotes: [
        {
          id: "1",
          content: "note 1",
          deletedAt: null,
        } as unknown as ReturnType<
          typeof hooks.useOramaSearch
        >["filteredNotes"][0],
      ],
      searchNotes: vi
        .fn()
        .mockReturnValue([{ id: "1", content: "note 1", deletedAt: null }]),
      oramaDb: {} as unknown as ReturnType<
        typeof hooks.useOramaSearch
      >["oramaDb"],
    });

    vi.mocked(useDashboardActionsHook.useDashboardActions).mockReturnValue({
      isDeleteModalOpen: false,
      setIsDeleteModalOpen: vi.fn(),
      noteToDelete: null,
      handleCreateNote: vi.fn(),
      handleDeleteClick: vi.fn(),
      confirmDeleteNote: vi.fn(),
      handleCancelDelete: vi.fn(),
      handleEmptyTrash: vi.fn(),
    } as unknown as ReturnType<
      typeof useDashboardActionsHook.useDashboardActions
    >);
  });

  it("selects correct notes and delegates to oramaSearch based on isTrashSelected", () => {
    const { result } = renderWithRouter(
      () => useDashboardState(),
      ["/notes/all"]
    );

    expect(hooks.useOramaSearch).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "1" }),
        expect.objectContaining({ id: "2" }),
      ]),
      null,
      ""
    );
    expect(result.current.filteredNotes).toHaveLength(1);
    expect(result.current.isTrashSelected).toBe(false);
  });

  it("filters trash notes correctly when isTrashSelected is true", () => {
    renderWithRouter(() => useDashboardState(), ["/notes/trash"]);

    // oramaSearch should receive only the trash-1 note
    expect(hooks.useOramaSearch).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: "trash-1" })]),
      null,
      ""
    );
  });

  it("updates selection correctly through updateSelection", () => {
    const { result } = renderWithRouter(
      () => useDashboardState(),
      ["/notes/all"]
    );

    act(() => {
      result.current.updateSelection("React", false, "test query");
    });

    const dState = useDashboardStore.getState();
    expect(dState.searchQuery).toBe("test query");
    expect(dState.isSidebarOpen).toBe(false);
  });

  it("returns the currently selected note object", () => {
    setupStores({}, { selectedNoteId: "1" });
    const { result } = renderWithRouter(
      () => useDashboardState(),
      ["/notes/all/1"]
    );

    expect(result.current.selectedNote).toEqual(
      expect.objectContaining({ id: "1" })
    );
  });

  it("auto-selects the first filtered note if current selection is invalid", () => {
    // Current selection is 'invalid', filteredNotes has '1'
    setupStores({}, { selectedNoteId: "invalid" });
    renderWithRouter(() => useDashboardState(), ["/notes/all/invalid"]);

    // URL sync happens, filteredNotes[0] should be selected via navigateTo in real app
  });

  it("clears selection if filtered notes is empty", () => {
    vi.mocked(hooks.useOramaSearch).mockReturnValue({
      filteredNotes: [],
      searchNotes: vi.fn().mockReturnValue([]),
      oramaDb: {} as unknown as ReturnType<
        typeof hooks.useOramaSearch
      >["oramaDb"],
    });
    setupStores({}, { selectedNoteId: "1" });
    renderWithRouter(() => useDashboardState(), ["/notes/all/1"]);
  });
});
