import type { Metadata } from "next";
import { SignupContainer } from "@/features/auth/components/SignupContainer";

export const metadata: Metadata = {
  title: "新規登録 | Simplenote Clone",
  description: "Simplenote Cloneの新しいアカウントを作成します",
};

export default function SignupPage() {
  return <SignupContainer />;
}
