import type { TagListResponse } from "@simple-markdown-note/common/schemas";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as tagsRequests from "../../requests/tags/listTags";
import { createWrapper } from "./test-utils";
import { useTags } from "./useTags";

vi.mock("../../requests/tags/listTags");

describe("useTags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
