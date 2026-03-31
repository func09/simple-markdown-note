import type { Metadata } from "next";
import { Signup } from "@/features/auth/components/Signup";

export const metadata: Metadata = {
  title: "新規登録 | Simplenote Clone",
  description: "Simplenote Cloneの新しいアカウントを作成します",
};

export default function SignupPage() {
  return <Signup />;
}
