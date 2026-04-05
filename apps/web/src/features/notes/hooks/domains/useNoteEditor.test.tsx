import { renderHook } from "@testing-library/react";
import { useEditor } from "@tiptap/react";
import type { MutableRefObject } from "react";
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

describe("useNoteEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseEditor.mockReturnValue(
      mockEditor as unknown as ReturnType<typeof useEditor>
    );
  });

  it("should initialize editor", () => {
    const contentRef = { current: "" };
    const lastNoteIdRef = { current: null };

    renderHook(() =>
      useNoteEditor({
        note: { id: "1", content: "hello" },
        isPreview: false,
        setIsPreview: vi.fn(),
        onUpdate: vi.fn(),
        contentRef: contentRef as unknown as MutableRefObject<string>,
        lastNoteIdRef: lastNoteIdRef as unknown as MutableRefObject<
          string | null
        >,
      })
    );

    expect(mockedUseEditor).toHaveBeenCalled();
  });
});
