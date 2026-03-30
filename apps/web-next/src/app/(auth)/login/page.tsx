import type { Metadata } from "next";
import { LoginContainer } from "@/features/auth/components/LoginContainer";

export const metadata: Metadata = {
  title: "ログイン | Simplenote Clone",
  description: "Simplenote Cloneのアカウントにログインします",
};

export default function LoginPage() {
  return <LoginContainer />;
}
