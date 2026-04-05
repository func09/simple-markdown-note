import { vi } from "vitest";

export const createApiMock = () => ({
  notes: {
    $get: vi.fn(),
    $post: vi.fn(),
    $url: () => new URL("http://localhost/api/notes"),
    ":id": {
      $get: vi.fn(),
      $patch: vi.fn(),
      $delete: vi.fn(),
      $url: () => new URL("http://localhost/api/notes/123"),
    },
  },
});
