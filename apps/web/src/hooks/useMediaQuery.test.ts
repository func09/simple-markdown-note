import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "../hooks/useMediaQuery";

describe("useMediaQuery", () => {
  let addEventListenerMock: ReturnType<typeof vi.fn>;
  let removeEventListenerMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    addEventListenerMock = vi.fn();
    removeEventListenerMock = vi.fn();

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return false if matchMedia matches is false initially", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
  });

  it("should return true if matchMedia matches is true initially", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
      })),
    });

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("should update state when media query change event is fired", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);

    // Get the registered change listener
    expect(addEventListenerMock).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
    const listener = addEventListenerMock.mock.calls[0][1];

    // Simulate a change event where the media query now matches
    act(() => {
      listener({ matches: true } as unknown as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);

    // Simulate a change event where it no longer matches
    act(() => {
      listener({ matches: false } as unknown as MediaQueryListEvent);
    });

    expect(result.current).toBe(false);
  });

  it("should cleanup event listener on unmount", () => {
    const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );

    // The exact function passed to removeEventListener should be the same one passed to addEventListener
    const addListener = addEventListenerMock.mock.calls[0][1];
    const removeListener = removeEventListenerMock.mock.calls[0][1];
    expect(addListener).toBe(removeListener);
  });
});
