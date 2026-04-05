import { act, renderHook } from "@testing-library/react-native";
import { useDrawerState } from "./useNoteState";

jest.mock("../components/NoteDrawer", () => ({
  DRAWER_WIDTH: 280,
}));

describe("useDrawerState", () => {
  it("initializes with drawer closed", () => {
    const { result } = renderHook(() => useDrawerState());
    expect(result.current.isDrawerOpen).toBe(false);
  });

  it("opens the drawer on toggleDrawer(true)", () => {
    const { result } = renderHook(() => useDrawerState());
    act(() => {
      result.current.toggleDrawer(true);
    });
    expect(result.current.isDrawerOpen).toBe(true);
  });

  it("exposes slideAnim", () => {
    const { result } = renderHook(() => useDrawerState());
    expect(result.current.slideAnim).toBeDefined();
  });
});
