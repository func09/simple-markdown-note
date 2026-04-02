import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { TagListResponse } from "common/schemas";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../client";
import { ApiProvider } from "../context";
import * as tagsRequests from "../requests/tagsRequests";
import { useTags } from "./tagsHooks";

vi.mock("../requests/tagsRequests");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ApiProvider client={{} as ApiClient}>{children}</ApiProvider>
    </QueryClientProvider>
  );
};

describe("tagsQueries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useTags", () => {
    it("should return tags list", async () => {
      const mockData = ["tag1", "tag2"];
      vi.mocked(tagsRequests.listTags).mockResolvedValue(
        mockData as unknown as TagListResponse
      );

      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });
  });
});
