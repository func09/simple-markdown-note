import { useLogout } from "@simple-markdown-note/api-client/hooks";
import { act, renderHook } from "@testing-library/react-native";
import { useAuthStore } from "../../../auth/store";
import { useNoteDrawerActions } from "./useNoteDrawerActions";

jest.mock("@simple-markdown-note/api-client/hooks", () => ({
  useLogout: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../../auth/store", () => ({
  useAuthStore: jest.fn(),
}));

// サイドドロワーにおける認証などのアクションを切り出したフックのテスト
describe("useNoteDrawerActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockMutate = jest.fn();
    (useLogout as jest.Mock).mockReturnValue({ mutate: mockMutate });
    (useAuthStore as unknown as jest.Mock).mockImplementation(
      (selector: unknown) =>
        (selector as (s: { clearAuth: () => void }) => unknown)({
          clearAuth: jest.fn(),
        })
    );
  });

  // ログアウト処理が呼び出された際に、内部的に logoutMutation.mutate が実行されることを検証する
  it("handleLogout calls logoutMutation.mutate", () => {
    const mockMutate = jest.fn();
    (useLogout as jest.Mock).mockReturnValue({ mutate: mockMutate });

    const onClose = jest.fn();
    const { result } = renderHook(() => useNoteDrawerActions(onClose));
    act(() => {
      result.current.handleLogout();
    });

    expect(mockMutate).toHaveBeenCalled();
  });

  // ログアウト成功時 (onSuccess 発火時) にサイドドロワーが閉じられ、同時に認証情報がクリアされることを検証する
  it("handleLogout callback onSuccess triggers onClose and clearAuth", () => {
    let onSuccessCallback: () => void = () => {};
    (useLogout as jest.Mock).mockImplementation(({ onSuccess }) => {
      if (onSuccess) onSuccessCallback = onSuccess;
      return { mutate: jest.fn() };
    });

    const mockClearAuth = jest.fn();
    (useAuthStore as unknown as jest.Mock).mockImplementation(
      (selector: (s: { clearAuth: () => void }) => unknown) =>
        selector({ clearAuth: mockClearAuth })
    );

    const onClose = jest.fn();
    renderHook(() => useNoteDrawerActions(onClose));

    act(() => {
      onSuccessCallback();
    });

    expect(onClose).toHaveBeenCalled();
    expect(mockClearAuth).toHaveBeenCalled();
  });
});
