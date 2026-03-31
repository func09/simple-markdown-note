import type * as React from "react";
import { Button } from "../../Button";
import { cn } from "../../lib/utils";

export function AlertDialog({
  children,
  open,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {children}
    </div>
  );
}

export function AlertDialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
      <div
        className={cn(
          "relative z-50 w-full max-w-md overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in duration-200",
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

export function AlertDialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AlertDialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-lg font-semibold text-white", className)}>
      {children}
    </h3>
  );
}

export function AlertDialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("text-sm text-slate-400", className)}>{children}</p>;
}

export function AlertDialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AlertDialogAction({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="default"
      onClick={onClick}
      className={cn("bg-red-500 hover:bg-red-600 shadow-red-500/20", className)}
    >
      {children}
    </Button>
  );
}

export function AlertDialogCancel({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Button variant="outline" onClick={onClick} className={className}>
      {children}
    </Button>
  );
}
