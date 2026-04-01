import { createContext, type ReactNode, useContext } from "react";
import type { ApiClient } from "./client";

const ApiContext = createContext<ApiClient | null>(null);

export const ApiProvider = ({
  children,
  client,
}: {
  children: ReactNode;
  client: ApiClient;
}) => <ApiContext.Provider value={client}>{children}</ApiContext.Provider>;

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) throw new Error("useApi must be used within ApiProvider");
  return context;
};
