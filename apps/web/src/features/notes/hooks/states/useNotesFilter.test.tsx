import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useNotesStore } from "@/features/notes/store";
import { useNotesFilter } from "./useNotesFilter";

// 選択中のノートスコープとタグに基づいて、APIやURLのクエリ文字列を組み立てるフックのテスト
describe("useNotesFilter", () => {
  // スコープが"all"でタグが設定されていない場合、空のクエリ文字列を返すことを検証する
  it("should return empty string when scope is all and tag is empty", () => {
    const { result } = renderHook(() => useNotesFilter());
    expect(result.current).toBe("");
  });

  // スコープが"all"以外（例："trash"）の場合、該当するスコープのクエリ文字列を返すことを検証する
  it("should return scope query when scope is not all", () => {
    act(() => {
      useNotesStore.getState().setFilterScope("trash");
    });
    const { result } = renderHook(() => useNotesFilter());
    expect(result.current).toBe("?scope=trash");
  });

  // タグが指定されている場合、タグ情報のクエリ文字列を返すことを検証する
  it("should return tag query when tag is present", () => {
    act(() => {
      useNotesStore.getState().setFilterTag("important");
    });
    const { result } = renderHook(() => useNotesFilter());
    expect(result.current).toBe("?tag=important");
  });

  // スコープとタグの両方が指定されている場合、両方を結合したクエリ文字列を返すことを検証する
  it("should return combined query when both scope and tag are present", () => {
    act(() => {
      useNotesStore.setState({ filterScope: "trash", filterTag: "important" });
    });
    const { result } = renderHook(() => useNotesFilter());
    expect(result.current).toBe("?scope=trash&tag=important");
  });
});
