import type { ReactNode } from "react";
import { GuestGuard } from "@/features/auth/components/GuestGuard";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGuard>
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 p-4 selection:bg-slate-900/10">
        {children}
      </div>
    </GuestGuard>
  );
}
