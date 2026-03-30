"use client";

import dynamic from "next/dynamic";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSignup } from "../hooks/useAuthLogic";

const DesktopView = dynamic(() => import("./desktop/SignupForm"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-slate-100 h-96 w-full max-w-md rounded-xl" />
  ),
});

const MobileView = dynamic(() => import("./mobile/SignupForm"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-slate-100 h-96 w-full rounded-xl" />
  ),
});

export function SignupContainer() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { handleSignup, isLoading, error } = useSignup();

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      {isDesktop ? (
        <DesktopView
          onSubmit={handleSignup}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <MobileView
          onSubmit={handleSignup}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
}
