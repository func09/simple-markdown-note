import { describe, expect, it } from "vitest";
import { renderResetPasswordEmail, renderVerifyEmail } from "./index";

/**
 * メール出力ルーター (render関数) のテスト
 */
describe("Email Renderers", () => {
  describe("renderResetPasswordEmail", () => {
    /**
     * htmlとプレーンテキストの両方が正常に生成され、各々指定されたリンクが含まれることを確認する
     */
    it("should return HTML and plain text with the correct link", async () => {
      const { html, text } = await renderResetPasswordEmail({
        resetLink: "https://example.com/reset?token=123",
        userEmail: "test@example.com",
      });

      expect(html).toContain("https://example.com/reset?token=123");
      expect(html).toContain("test@example.com");

      expect(text).toContain("https://example.com/reset?token=123");
    });
  });

  describe("renderVerifyEmail", () => {
    /**
     * htmlとプレーンテキストの両方が正常に生成され、各々指定されたリンクが含まれることを確認する
     */
    it("should return HTML and plain text with the correct link", async () => {
      const { html, text } = await renderVerifyEmail({
        verifyLink: "https://example.com/verify?token=abc",
        userEmail: "test2@example.com",
      });

      expect(html).toContain("https://example.com/verify?token=abc");
      expect(html).toContain("test2@example.com");

      expect(text).toContain("https://example.com/verify?token=abc");
    });
  });
});
