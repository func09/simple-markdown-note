import { renderHook } from "@testing-library/react-native";
import { useNoteCheckbox } from "./useNoteLogic";

// ---------------------------------------------------------------------------
// useNoteCheckbox
// ---------------------------------------------------------------------------

describe("useNoteCheckbox", () => {
  it("toggles unchecked checkbox to checked", () => {
    const { result } = renderHook(() => useNoteCheckbox());
    const toggled = result.current.toggleCheckboxInContent(
      "- [ ] task one\n- [ ] task two",
      0
    );
    expect(toggled).toContain("- [x] task one");
    expect(toggled).toContain("- [ ] task two");
  });

  it("toggles checked checkbox to unchecked", () => {
    const { result } = renderHook(() => useNoteCheckbox());
    const toggled = result.current.toggleCheckboxInContent("- [x] done", 0);
    expect(toggled).toContain("- [ ] done");
  });

  it("only toggles the checkbox at the specified index", () => {
    const { result } = renderHook(() => useNoteCheckbox());
    const content = "- [ ] first\n- [ ] second\n- [ ] third";
    const toggled = result.current.toggleCheckboxInContent(content, 1);
    expect(toggled).toContain("- [ ] first");
    expect(toggled).toContain("- [x] second");
    expect(toggled).toContain("- [ ] third");
  });
});
