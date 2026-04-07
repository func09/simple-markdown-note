import { render } from "@react-email/render";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { ResetPasswordEmail } from "./ResetPassword";

/**
 * パスワードリセット用メールテンプレートのテスト
 */
describe("ResetPasswordEmail Template", () => {
  /**
   * コンポーネント単体としてPropを受け取り、生成されたHTMLに正しく反映されることを確認する
   */
  it("should render correctly with given props", async () => {
    const html = await render(
      React.createElement(ResetPasswordEmail, {
        resetLink: "https://example.com/reset?token=123",
        userEmail: "test@example.com",
      })
    );

    expect(html).toContain("https://example.com/reset?token=123");
    expect(html).toContain("test@example.com");
  });
});
