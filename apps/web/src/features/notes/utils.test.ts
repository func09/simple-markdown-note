import { describe, expect, it } from "vitest";
import { escapeHtml, formatDate } from "./utils";

// ユーティリティ関数のテスト
describe("notes utils", () => {
  // formatDateのテスト
  describe("formatDate", () => {
    // nullまたはundefinedが渡された場合はN/Aが返ることを検証する
    it("returns 'N/A' if date is undefined or null", () => {
      expect(formatDate(undefined)).toBe("N/A");
      expect(formatDate(null)).toBe("N/A");
    });

    // 24時間以内の場合は時刻がフォーマットされて返ることを検証する
    it("returns time string if date is within 24 hours", () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const expectedTimeStr = oneHourAgo.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      expect(formatDate(oneHourAgo.toISOString())).toBe(expectedTimeStr);
    });

    // 24時間以上経過している場合は日付がフォーマットされて返ることを検証する
    it("returns date string if date is older than 24 hours", () => {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const expectedDateStr = twoDaysAgo.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
      expect(formatDate(twoDaysAgo.toISOString())).toBe(expectedDateStr);
    });
  });

  // escapeHtmlのテスト
  describe("escapeHtml", () => {
    // HTMLの特殊文字がエスケープされることを検証する
    it("escapes html special characters", () => {
      expect(escapeHtml("<html>&foo</html>")).toBe(
        "&lt;html&gt;&amp;foo&lt;/html&gt;"
      );
    });
  });
});
