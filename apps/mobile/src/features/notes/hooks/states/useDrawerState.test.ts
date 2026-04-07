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

// ドロワーのアニメーションや開閉状態を管理するフックのテスト
describe("useDrawerState", () => {
  // 初期状態ではドロワーが閉じているフラグ (isDrawerOpen = false) となっていることを検証する
  it("initializes with drawer closed", () => {
    const { result } = renderHook(() => useDrawerState());
    expect(result.current.isDrawerOpen).toBe(false);
  });

  // toggleDrawer に対して true を渡した際、ドロワーを開くフラグが即座に設定されることを検証する
  it("opens the drawer on toggleDrawer(true)", () => {
    const { result } = renderHook(() => useDrawerState());
    act(() => {
      result.current.toggleDrawer(true);
    });
    expect(result.current.isDrawerOpen).toBe(true);
  });

  // ドロワーを閉じるアニメーションが最後まで完了した場合に、isDrawerOpen フラグが false に戻ることを検証する
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

  // ドロワーを開くアニメーションが完了した場合は、isDrawerOpen が引き続き true で維持されることを検証する
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

  // ドロワーを閉じるアニメーションが途中で中断（完了フラグがfalse）された場合は、安全のため isDrawerOpen を false にしないことを検証する
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

  // ドロワー開閉を描画するための Animated.Value(slideAnim) インスタンスが正しくフックから公開されることを検証する
  it("exposes slideAnim", () => {
    const { result } = renderHook(() => useDrawerState());
    expect(result.current.slideAnim).toBeDefined();
  });
});
