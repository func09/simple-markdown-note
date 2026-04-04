import { useLogin as useLoginMutation } from "@simple-markdown-note/api-client/hooks";
import { act, renderHook } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useLoginScreen } from "./hooks";
import { useAuthStore } from "./store";

// Mock dependencies
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@simple-markdown-note/api-client/hooks", () => ({
  useLogin: jest.fn(),
}));

jest.mock("./store", () => ({
  useAuthStore: jest.fn(),
}));

describe("useLogin hook", () => {
  const mockReplace = jest.fn();
  const mockSetAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });

    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({ setAuth: mockSetAuth });
    });

    (useLoginMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      error: null,
    });
  });

  it("should return the necessary form and mutation states", () => {
    const { result } = renderHook(() => useLoginScreen());

    expect(result.current.control).toBeDefined();
    expect(typeof result.current.handleSubmit).toBe("function");
    expect(result.current.errors).toBeDefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.apiError).toBeNull();
  });

  it("should call setAuth and router.replace when mutation is successful", () => {
    let capturedOnSuccess:
      | ((data: {
          user: { id: string; name: string; email: string };
          token: string;
        }) => void)
      | undefined;

    (useLoginMutation as jest.Mock).mockImplementation(({ onSuccess }) => {
      capturedOnSuccess = onSuccess;
      return {
        mutate: jest.fn(),
        isPending: false,
        error: null,
      };
    });

    renderHook(() => useLoginScreen());

    // 内部で設定されたonSuccessコールバックを手動でトリガーする
    act(() => {
      if (capturedOnSuccess) {
        capturedOnSuccess({
          user: { id: "1", name: "Test User", email: "test@example.com" },
          token: "dummy-token",
        });
      }
    });

    expect(mockSetAuth).toHaveBeenCalledWith(
      { id: "1", name: "Test User", email: "test@example.com" },
      "dummy-token"
    );
    expect(mockReplace).toHaveBeenCalledWith("/(main)/notes");
  });
});
