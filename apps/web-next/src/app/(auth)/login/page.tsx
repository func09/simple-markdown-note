import type { Metadata } from "next";
import { Login } from "@/features/auth/components/Login";

export const metadata: Metadata = {
  title: "ログイン | Simplenote Clone",
  description: "Simplenote Cloneのアカウントにログインします",
};

export default function LoginPage() {
  return <Login />;
}
