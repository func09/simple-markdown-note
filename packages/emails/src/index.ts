import { render } from "@react-email/render";
import * as React from "react";
import { ResetPasswordEmail } from "./templates/ResetPassword";
import { VerifyEmail } from "./templates/VerifyEmail";

export { ResetPasswordEmail, VerifyEmail };

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

/**
 * メール認証のHTMLとプレーンテキストを生成します
 */
export const renderVerifyEmail = async (props: {
  verifyLink: string;
  userEmail?: string;
}) => {
  const html = await render(React.createElement(VerifyEmail, props));
  const text = await render(React.createElement(VerifyEmail, props), {
    plainText: true,
  });

  return { html, text };
};
