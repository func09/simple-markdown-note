import { renderHook } from "@testing-library/react-native";
import { Alert, Platform } from "react-native";
import { useTagPrompt } from "./useTagPrompt";

// ユーザーに対してタグ入力用のプロンプトを表示するフックについてのテスト
describe("useTagPrompt", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // iOS 環境の場合、ネイティブの Alert.prompt が意図したパラメータで正しく呼び出されることを検証する
  it("calls Alert.prompt on iOS", () => {
    Platform.OS = "ios";
    const promptSpy = jest
      .spyOn(Alert, "prompt")
      .mockImplementation(() => undefined);
    const { result } = renderHook(() => useTagPrompt());

    result.current.promptForTag([], jest.fn());

    expect(promptSpy).toHaveBeenCalledWith(
      "Add Tag",
      "Enter a name for the new tag",
      expect.any(Function)
    );
  });

  // Android 環境の場合、Alert.prompt の代替として Alert.alert（カスタムダイアログの表示など）が呼び出されることを検証する
  it("calls Alert.alert on Android", () => {
    Platform.OS = "android";
    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation(() => undefined);
    const { result } = renderHook(() => useTagPrompt());

    result.current.promptForTag([], jest.fn());

    expect(alertSpy).toHaveBeenCalled();
  });

  // iOS でプロンプトに新しいタグが入力された際、前後の空白がトリムされてから onAdd コールバックが呼ばれることを検証する
  it("calls onAdd with trimmed tag when tag is new (iOS)", () => {
    Platform.OS = "ios";
    jest.spyOn(Alert, "prompt").mockImplementation((_title, _msg, callback) => {
      (callback as (text: string) => void)("  new tag  ");
    });
    const { result } = renderHook(() => useTagPrompt());
    const onAdd = jest.fn();

    result.current.promptForTag([], onAdd);

    expect(onAdd).toHaveBeenCalledWith("new tag");
  });

  // 既に追加済みのタグが入力された場合、重複を防ぐため onAdd コールバックが呼ばれないことを検証する
  it("does not call onAdd when tag already exists (iOS)", () => {
    Platform.OS = "ios";
    jest.spyOn(Alert, "prompt").mockImplementation((_title, _msg, callback) => {
      (callback as (text: string) => void)("existing");
    });
    const { result } = renderHook(() => useTagPrompt());
    const onAdd = jest.fn();

    result.current.promptForTag(["existing"], onAdd);

    expect(onAdd).not.toHaveBeenCalled();
  });

  // 空文字や空白のみが入力された場合、無効なタグとして扱い onAdd コールバックが呼ばれないことを検証する
  it("does not call onAdd for empty input (iOS)", () => {
    Platform.OS = "ios";
    jest.spyOn(Alert, "prompt").mockImplementation((_title, _msg, callback) => {
      (callback as (text: string) => void)("   ");
    });
    const { result } = renderHook(() => useTagPrompt());
    const onAdd = jest.fn();

    result.current.promptForTag([], onAdd);

    expect(onAdd).not.toHaveBeenCalled();
  });
});
