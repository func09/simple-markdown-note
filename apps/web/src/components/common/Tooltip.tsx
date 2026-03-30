import type * as React from "react";
import { cn } from "@/lib/utils";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  return <div className="group relative inline-block">{children}</div>;
}

export function TooltipTrigger({
  children,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  return <div className="inline-block">{children}</div>;
}

export function TooltipContent({
  children,
  className,
  side = "top",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}) {
  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-50 rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-200 shadow-lg opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap border border-slate-700",
        sideClasses[side],
        className
      )}
    >
      {children}
      <div
        className={cn(
          "absolute h-2 w-2 rotate-45 bg-slate-800 border-slate-700",
          side === "top" &&
            "bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b",
          side === "bottom" &&
            "top-[-4px] left-1/2 -translate-x-1/2 border-l border-t",
          side === "left" &&
            "right-[-4px] top-1/2 -translate-y-1/2 border-r border-t",
          side === "right" &&
            "left-[-4px] top-1/2 -translate-y-1/2 border-l border-b"
        )}
      />
    </div>
  );
}
