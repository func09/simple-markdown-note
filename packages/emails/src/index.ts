import { render } from "@react-email/components";
import * as React from "react";
import { ResetPasswordEmail } from "./templates/ResetPassword";

export { ResetPasswordEmail };

/**
 * パスワードリセットメールのHTMLとプレーンテキストを生成します
 */
export const renderResetPasswordEmail = async (props: {
  resetLink: string;
  userEmail?: string;
}) => {
  // render() returns a promise in the async backend
  const html = await render(React.createElement(ResetPasswordEmail, props));
  const text = await render(React.createElement(ResetPasswordEmail, props), {
    plainText: true,
  });

  return { html, text };
};
