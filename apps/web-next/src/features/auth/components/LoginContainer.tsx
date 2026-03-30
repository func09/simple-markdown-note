"use client";

import dynamic from "next/dynamic";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAuthLogic } from "../hooks/useAuthLogic";

const DesktopView = dynamic(() => import("./desktop/LoginForm"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-slate-100 h-96 w-full max-w-md rounded-xl" />
  ),
});

const MobileView = dynamic(() => import("./mobile/LoginForm"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-slate-100 h-96 w-full rounded-xl" />
  ),
});

export function LoginContainer() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { handleSubmit, isLoading, error } = useAuthLogic("login");

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      {isDesktop ? (
        <DesktopView
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <MobileView
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
}
