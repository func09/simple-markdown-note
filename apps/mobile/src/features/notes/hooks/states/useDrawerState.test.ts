import { act, renderHook } from "@testing-library/react-native";
import { Animated } from "react-native";
import { useDrawerState } from "./useDrawerState";

jest.mock("../../constants", () => {
  const actual = jest.requireActual("../../constants");
  return {
    ...actual,
    DRAWER_WIDTH: 280,
  };
});

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

  it("sets isDrawerOpen to false when closing animation finishes", () => {
    let animCallback: (arg: { finished: boolean }) => void = () => {};
    jest.spyOn(Animated, "timing").mockImplementation(
      () =>
        ({
          start: (callback?: (arg: { finished: boolean }) => void) => {
            if (callback) animCallback = callback;
          },
        }) as unknown as Animated.CompositeAnimation
    );

    const { result } = renderHook(() => useDrawerState());

    act(() => {
      result.current.toggleDrawer(true);
    });
    expect(result.current.isDrawerOpen).toBe(true);

    act(() => {
      result.current.toggleDrawer(false);
    });

    act(() => {
      animCallback({ finished: true });
    });

    expect(result.current.isDrawerOpen).toBe(false);
  });

  it("does not set isDrawerOpen to false when opening animation finishes", () => {
    let animCallback: (arg: { finished: boolean }) => void = () => {};
    jest.spyOn(Animated, "timing").mockImplementation(
      () =>
        ({
          start: (callback?: (arg: { finished: boolean }) => void) => {
            if (callback) animCallback = callback;
          },
        }) as unknown as Animated.CompositeAnimation
    );

    const { result } = renderHook(() => useDrawerState());
    act(() => {
      result.current.toggleDrawer(true);
    });
    act(() => {
      animCallback({ finished: true });
    });
    expect(result.current.isDrawerOpen).toBe(true);
  });

  it("does not set isDrawerOpen to false when closing animation is interrupted", () => {
    let animCallback: (arg: { finished: boolean }) => void = () => {};
    jest.spyOn(Animated, "timing").mockImplementation(
      () =>
        ({
          start: (callback?: (arg: { finished: boolean }) => void) => {
            if (callback) animCallback = callback;
          },
        }) as unknown as Animated.CompositeAnimation
    );

    const { result } = renderHook(() => useDrawerState());
    // Open
    act(() => {
      result.current.toggleDrawer(true);
    });
    // Close
    act(() => {
      result.current.toggleDrawer(false);
    });
    // Interrupt
    act(() => {
      animCallback({ finished: false });
    });
    expect(result.current.isDrawerOpen).toBe(true);
  });

  it("exposes slideAnim", () => {
    const { result } = renderHook(() => useDrawerState());
    expect(result.current.slideAnim).toBeDefined();
  });
});
