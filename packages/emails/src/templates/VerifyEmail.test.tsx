import { render } from "@react-email/render";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { VerifyEmail } from "./VerifyEmail";

/**
 * アカウント認証用メールテンプレートのテスト
 */
describe("VerifyEmail Template", () => {
  /**
   * コンポーネント単体としてPropを受け取り、生成されたHTMLに正しく反映されることを確認する
   */
  it("should render correctly with given props", async () => {
    const html = await render(
      React.createElement(VerifyEmail, {
        verifyLink: "https://example.com/verify?token=123",
        userEmail: "test@example.com",
      })
    );

    expect(html).toContain("https://example.com/verify?token=123");
    expect(html).toContain("test@example.com");
  });
});
