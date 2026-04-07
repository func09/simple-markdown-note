import * as apiClientHooks from "@simple-markdown-note/api-client/hooks";
import { renderHook } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotesStore } from "@/features/notes/store";
import { useElectronMenu } from "./useElectronMenu";

vi.mock("@simple-markdown-note/api-client/hooks", () => ({
  useCreateNote: vi.fn(),
  useDeleteNote: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

const mockedHooks = vi.mocked(apiClientHooks);
const mockNavigate = vi.fn();

// デスクトップ版におけるElectronネイティブメニューアクションを処理するフックのテスト
describe("useElectronMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    useNotesStore.getState().resetFilters();
    useNotesStore.getState().setSelectedNoteId(null);
  });

  // onNoteNew イベント発火時、新規ノート作成ミューテーションが実行され画面遷移することを検証する
  it("handles new note creation via electron menu", async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({ id: "new-note-id" });
    mockedHooks.useCreateNote.mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as unknown as ReturnType<typeof apiClientHooks.useCreateNote>);
    mockedHooks.useDeleteNote.mockReturnValue(
      {} as unknown as ReturnType<typeof apiClientHooks.useDeleteNote>
    );

    let onNewNoteCb: () => Promise<void> = async () => {};
    window.electron = {
      onNoteNew: vi.fn((cb) => {
        onNewNoteCb = cb;
        return vi.fn();
      }),
      onNoteDelete: vi.fn(() => vi.fn()),
      platform: "darwin",
    };

    useNotesStore.getState().setFilterTag("urgent");

    renderHook(() => useElectronMenu());

    await onNewNoteCb();

    expect(mockMutateAsync).toHaveBeenCalledWith({
      content: "",
      isPermanent: false,
      tags: ["urgent"],
    });
    expect(mockNavigate).toHaveBeenCalledWith("/notes/new-note-id");
    expect(useNotesStore.getState().selectedNoteId).toBe("new-note-id");
  });

  // APIエラー時にコンソールにエラーが出力されクラッシュしないことを検証する
  it("handles new note creation failure gracefully", async () => {
    const mockMutateAsync = vi.fn().mockRejectedValue(new Error("API Error"));
    mockedHooks.useCreateNote.mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as unknown as ReturnType<typeof apiClientHooks.useCreateNote>);
    mockedHooks.useDeleteNote.mockReturnValue(
      {} as unknown as ReturnType<typeof apiClientHooks.useDeleteNote>
    );

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    let onNewNoteCb: () => Promise<void> = async () => {};
    window.electron = {
      onNoteNew: vi.fn((cb) => {
        onNewNoteCb = cb;
        return vi.fn();
      }),
      onNoteDelete: vi.fn(() => vi.fn()),
      platform: "darwin",
    };

    renderHook(() => useElectronMenu());

    await onNewNoteCb();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to create note from menu:",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  // onNoteDelete イベント発火時に確認アラートが表示され、承認で削除と画面遷移が行われることを検証する
  it("handles note deletion via electron menu", async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({});
    mockedHooks.useCreateNote.mockReturnValue(
      {} as unknown as ReturnType<typeof apiClientHooks.useCreateNote>
    );
    mockedHooks.useDeleteNote.mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as unknown as ReturnType<typeof apiClientHooks.useDeleteNote>);

    let onDeleteNoteCb: () => Promise<void> = async () => {};
    window.electron = {
      onNoteNew: vi.fn(() => vi.fn()),
      onNoteDelete: vi.fn((cb) => {
        onDeleteNoteCb = cb;
        return vi.fn();
      }),
      platform: "darwin",
    };

    useNotesStore.getState().setSelectedNoteId("selected-note-id");
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    renderHook(() => useElectronMenu());

    await onDeleteNoteCb();

    expect(confirmSpy).toHaveBeenCalledWith(
      "Are you sure you want to move this note to trash?"
    );
    expect(mockMutateAsync).toHaveBeenCalledWith("selected-note-id");
    expect(mockNavigate).toHaveBeenCalledWith("/notes");

    confirmSpy.mockRestore();
  });

  // onNoteDelete エラー時にコンソールにエラーが出力されクラッシュしないことを検証する
  it("handles note deletion failure gracefully", async () => {
    const mockMutateAsync = vi.fn().mockRejectedValue(new Error("API Error"));
    mockedHooks.useCreateNote.mockReturnValue(
      {} as unknown as ReturnType<typeof apiClientHooks.useCreateNote>
    );
    mockedHooks.useDeleteNote.mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as unknown as ReturnType<typeof apiClientHooks.useDeleteNote>);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    let onDeleteNoteCb: () => Promise<void> = async () => {};
    window.electron = {
      onNoteNew: vi.fn(() => vi.fn()),
      onNoteDelete: vi.fn((cb) => {
        onDeleteNoteCb = cb;
        return vi.fn();
      }),
      platform: "darwin",
    };

    useNotesStore.getState().setSelectedNoteId("selected-note-id");

    renderHook(() => useElectronMenu());

    await onDeleteNoteCb();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to delete note from menu:",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  // electronが未定義の場合、何も処理が行われないことを検証する
  it("does nothing if window.electron is undefined", () => {
    const originalElectron = window.electron;
    delete window.electron;

    renderHook(() => useElectronMenu());

    window.electron = originalElectron;
  });

  // selectedNoteIdがnullの場合、削除処理が行われないことを検証する
  it("does not delete note if selectedNoteId is null", async () => {
    const mockMutateAsync = vi.fn();
    mockedHooks.useDeleteNote.mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as unknown as ReturnType<typeof apiClientHooks.useDeleteNote>);

    let onDeleteNoteCb: () => Promise<void> = async () => {};
    window.electron = {
      onNoteNew: vi.fn(() => vi.fn()),
      onNoteDelete: vi.fn((cb) => {
        onDeleteNoteCb = cb;
        return vi.fn();
      }),
      platform: "darwin",
    };

    useNotesStore.getState().setSelectedNoteId(null);
    renderHook(() => useElectronMenu());

    await onDeleteNoteCb();

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
