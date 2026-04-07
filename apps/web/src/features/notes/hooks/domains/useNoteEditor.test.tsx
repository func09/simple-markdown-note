import { renderHook } from "@testing-library/react";
import { useEditor } from "@tiptap/react";
import type { RefObject } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNoteEditor } from "./useNoteEditor";

const mockEditor = {
  setEditable: vi.fn(),
  commands: { setContent: vi.fn() },
  isFocused: false,
  storage: {
    characterCount: {
      characters: () => 0,
      words: () => 0,
    },
  },
  on: vi.fn(),
  off: vi.fn(),
  destroy: vi.fn(),
};

vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn(() => mockEditor),
  EditorContent: () => null,
}));

vi.mock("@tiptap/starter-kit", () => ({
  default: { configure: vi.fn(() => ({})) },
}));
vi.mock("@tiptap/extension-placeholder", () => ({
  default: { configure: vi.fn(() => ({})) },
}));
vi.mock("@tiptap/extension-character-count", () => ({
  default: {},
}));
vi.mock("@tiptap/extension-link", () => ({
  default: { configure: vi.fn(() => ({})) },
}));

const mockedUseEditor = vi.mocked(useEditor);

// エディタの初期化と状態同期を管理するフックのテスト
describe("useNoteEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseEditor.mockReturnValue(
      mockEditor as unknown as ReturnType<typeof useEditor>
    );
  });

  // 初期設定としてエディタが初期化されることを検証する
  it("should initialize editor", () => {
    const contentRef = { current: "" };
    const lastNoteIdRef = { current: null };

    renderHook(() =>
      useNoteEditor({
        note: { id: "1", content: "hello" },
        isPreview: false,
        setIsPreview: vi.fn(),
        onUpdate: vi.fn(),
        contentRef: contentRef as unknown as RefObject<string>,
        lastNoteIdRef: lastNoteIdRef as unknown as RefObject<string | null>,
      })
    );

    expect(mockedUseEditor).toHaveBeenCalled();
  });

  // エディタの onUpdate イベントにより、指定された onUpdate コールバックが呼び出されることを検証する
  it("calls onUpdate when internal editor updates", () => {
    let mockOnUpdateCallback: ({ editor }: { editor: unknown }) => void =
      () => {};
    // overwrite global useEditor mock specifically for this test
    mockedUseEditor.mockImplementationOnce((config: unknown) => {
      mockOnUpdateCallback = (
        config as { onUpdate: ({ editor }: { editor: unknown }) => void }
      ).onUpdate;
      return mockEditor as unknown as ReturnType<typeof useEditor>;
    });

    const mockOnUpdate = vi.fn();
    const contentRef = { current: "" };
    const lastNoteIdRef = { current: null };

    renderHook(() =>
      useNoteEditor({
        note: { id: "1", content: "hello" },
        isPreview: false,
        setIsPreview: vi.fn(),
        onUpdate: mockOnUpdate,
        contentRef: contentRef as unknown as RefObject<string>,
        lastNoteIdRef: lastNoteIdRef as unknown as RefObject<string | null>,
      })
    );

    // Simulate editor update
    mockOnUpdateCallback({
      editor: { getText: vi.fn().mockReturnValue("new text") },
    });

    expect(mockOnUpdate).toHaveBeenCalledWith("new text");
  });

  // 非フォーカス時かつ新しいコンテンツが外部から渡された場合、エディタに反映されることを検証する
  it("updates editor content when note changes externally and editor is not focused", () => {
    const mockSetContent = vi.fn();
    mockedUseEditor.mockReturnValue({
      ...mockEditor,
      isFocused: false,
      commands: { setContent: mockSetContent },
    } as unknown as ReturnType<typeof useEditor>);

    const contentRef = { current: "old" };
    const lastNoteIdRef = { current: "1" };

    const { rerender } = renderHook(
      ({ note }) =>
        useNoteEditor({
          note,
          isPreview: false,
          setIsPreview: vi.fn(),
          onUpdate: vi.fn(),
          contentRef: contentRef as unknown as RefObject<string>,
          lastNoteIdRef: lastNoteIdRef as unknown as RefObject<string | null>,
        }),
      {
        initialProps: { note: { id: "1", content: "old" } },
      }
    );

    // Rerender with new content for same note
    rerender({ note: { id: "1", content: "new external content" } });

    expect(mockSetContent).toHaveBeenCalledWith("<p>new external content</p>", {
      emitUpdate: false,
    });
    expect(contentRef.current).toBe("new external content");
  });

  // プレビューとゴミ箱にあるノートの場合の設定が反映されることを検証する
  it("configures editor class correctly for preview and trashed note", () => {
    renderHook(() =>
      useNoteEditor({
        note: { id: "1", content: "hello", deletedAt: "2023-01-01" },
        isPreview: true,
        setIsPreview: vi.fn(),
        onUpdate: vi.fn(),
        contentRef: { current: "" } as unknown as RefObject<string>,
        lastNoteIdRef: { current: null } as unknown as RefObject<string | null>,
      })
    );

    expect(mockedUseEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        editable: false,
        editorProps: expect.objectContaining({
          attributes: expect.objectContaining({
            class: expect.stringContaining("hidden"),
          }),
        }),
      })
    );
  });
});
