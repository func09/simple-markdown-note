"use client";

import { FileText, Hash, LogOut, Trash2 } from "lucide-react";
import Link from "next/link";
import type { ElementType } from "react";
import { useCallback } from "react";
import { useAuthStore } from "@/features/auth";
import { useLogout, useTags } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useNotesStore } from "../store";

interface NavItemProps {
  href: string;
  icon: ElementType;
  label: string;
  active: boolean;
  count?: number;
  onClick: () => void;
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  count,
  onClick,
}: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
        active
          ? "bg-slate-200 text-slate-900"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={cn(
            "w-4 h-4",
            active
              ? "text-slate-900"
              : "text-slate-400 group-hover:text-slate-600"
          )}
        />
        <span>{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-xs text-slate-400 group-hover:text-slate-500">
          {count}
        </span>
      )}
    </Link>
  );
}

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { clearAuth } = useAuthStore();
  const { filterScope, filterTag, setFilterScope, setFilterTag } =
    useNotesStore();
  const { data: tags = [], isLoading } = useTags();
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout({
    onSuccess() {
      clearAuth();
    },
  });

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const handleAllNotes = useCallback(() => {
    setFilterScope("all");
    onClose?.();
  }, [setFilterScope, onClose]);

  const handleTrash = useCallback(() => {
    setFilterScope("trash");
    onClose?.();
  }, [setFilterScope, onClose]);

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 w-full overflow-y-auto custom-scrollbar">
      {/* App Logo / Title */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
            S
          </div>
          Simplenote
        </h1>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        <div className="space-y-1">
          <NavItem
            href="/notes?scope=all"
            icon={FileText}
            label="All Notes"
            active={filterScope === "all" && !filterTag}
            onClick={handleAllNotes}
          />
          <NavItem
            href="/notes?scope=trash"
            icon={Trash2}
            label="Trash"
            active={filterScope === "trash"}
            onClick={handleTrash}
          />
        </div>

        {/* Tags Section */}
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Tags
          </h3>
          <div className="space-y-1">
            {isLoading ? (
              <div className="px-3 py-2 text-xs text-slate-400 animate-pulse">
                Loading tags...
              </div>
            ) : (
              tags.map((tag) => (
                <NavItem
                  key={tag.name}
                  href={`/notes?tag=${tag.name}`}
                  icon={Hash}
                  label={tag.name}
                  active={filterTag === tag.name}
                  count={tag.count}
                  onClick={() => {
                    setFilterTag(tag.name);
                    onClose?.();
                  }}
                />
              ))
            )}
            {!isLoading && tags.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-400 italic">
                No tags yet
              </p>
            )}
          </div>
        </div>
      </nav>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-slate-200 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold shrink-0">
            {user?.email?.[0].toUpperCase() || "U"}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user?.email || "User Account"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </div>
  );
}
