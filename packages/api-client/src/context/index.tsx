import { createContext, type ReactNode, useContext } from "react";
import type { ApiClient } from "../client";

// ApiClient インスタンスを React ツリー全体で共有するためのコンテキスト
const ApiContext = createContext<ApiClient | null>(null);

/**
 * ApiClient をコンテキスト経由で提供するプロバイダー
 * アプリのルート付近でラップして使用する
 */
export const ApiProvider = ({
  children,
  client,
}: {
  children: ReactNode;
  client: ApiClient;
}) => <ApiContext.Provider value={client}>{children}</ApiContext.Provider>;

/**
 * ApiClient インスタンスを取得するフック
 * ApiProvider の外側で呼ぶとエラーになる
 */
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) throw new Error("useApi must be used within ApiProvider");
  return context;
};
