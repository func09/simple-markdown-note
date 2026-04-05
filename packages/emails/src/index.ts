import { render } from "@react-email/render";
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
  const html = await render(React.createElement(ResetPasswordEmail, props));
  const text = await render(React.createElement(ResetPasswordEmail, props), {
    plainText: true,
  });

  return { html, text };
};
