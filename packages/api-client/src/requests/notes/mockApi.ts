import { vi } from "vitest";
/**
 * ノート管理APIにおけるテスト用モックオブジェクト生成関数。
 * GET/POST/PUT/DELETEといったノート関連エンドポイントの挙動を模倣します。
 */
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
