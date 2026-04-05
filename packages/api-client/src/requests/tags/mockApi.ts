import { vi } from "vitest";

export const createApiMock = () => ({
  tags: {
    $get: vi.fn(),
    $url: () => new URL("http://localhost/api/tags"),
  },
});
