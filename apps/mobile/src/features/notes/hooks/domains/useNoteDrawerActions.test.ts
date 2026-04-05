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
});
