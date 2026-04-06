import { ApiProvider, createApiClient } from "@simple-markdown-note/api-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Constants from "expo-constants";
import type { ReactNode } from "react";
import { Platform } from "react-native";
import { useAuthStore } from "../features/auth/store";

// 開発環境ではマシンのIPアドレス、それ以外は環境変数から取得
const getBaseUrl = () => {
  // 0. 環境変数が設定されている場合は最優先（実機でのIP指定用）
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (__DEV__) {
    // 1. ExpoのマシンIPを優先
    const host = Constants.expoConfig?.hostUri?.split(":")[0];
    if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      return `http://${host}:8787/api`;
    }
    // 2. Androidエミュレータ用
    if (Platform.OS === "android") {
      return "http://10.0.2.2:8787/api";
    }
    // 3. iOSシミュレータ用
    return "http://localhost:8787/api";
  }
  return "https://api.example.com/api";
};

const apiClient = createApiClient(getBaseUrl(), {
  headers: () => {
    const token = useAuthStore.getState().token;
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

/**
 * アプリ全体のプロバイダーをラップするコンポーネント
 * React QueryやAPIクライアントの設定を提供する
 * @param {ProvidersProps} props コンポーネントのプロパティ
 * @returns {JSX.Element} プロバイダーコンポーネント
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider client={apiClient}>{children}</ApiProvider>
    </QueryClientProvider>
  );
}
