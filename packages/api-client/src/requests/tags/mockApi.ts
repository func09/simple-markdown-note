import { vi } from "vitest";
/**
 * タグ機能APIにおけるテスト用モックオブジェクト生成関数。
 * タグの取得機能などのエンドポイントの挙動をモックします。
 */
export const createApiMock = () => ({
  tags: {
    $get: vi.fn(),
    $url: () => new URL("http://localhost/api/tags"),
  },
});
