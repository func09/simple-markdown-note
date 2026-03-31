"use client";

import { FileText, Hash, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ElementType } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onClose?: () => void;
}

// モックデータ: タグ一覧
const MOCK_TAGS = [
  { id: "1", name: "work", count: 12 },
  { id: "2", name: "personal", count: 5 },
  { id: "3", name: "ideas", count: 8 },
  { id: "4", name: "recipes", count: 3 },
  { id: "5", name: "project-x", count: 15 },
];

export function Sidebar({ onClose }: SidebarProps) {
  const searchParams = useSearchParams();
  const currentScope = searchParams.get("scope") || "all";
  const currentTag = searchParams.get("tag");

  const NavItem = ({
    href,
    icon: Icon,
    label,
    active,
    count,
  }: {
    href: string;
    icon: ElementType;
    label: string;
    active: boolean;
    count?: number;
  }) => (
    <Link
      href={href}
      onClick={onClose}
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
            active={currentScope === "all" && !currentTag}
          />
          <NavItem
            href="/notes?scope=trash"
            icon={Trash2}
            label="Trash"
            active={currentScope === "trash"}
          />
        </div>

        {/* Tags Section */}
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Tags
          </h3>
          <div className="space-y-1">
            {MOCK_TAGS.map((tag) => (
              <NavItem
                key={tag.id}
                href={`/notes?tag=${tag.name}`}
                icon={Hash}
                label={tag.name}
                active={currentTag === tag.name}
                count={tag.count}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer / User Profile Placeholder */}
      <div className="p-4 border-t border-slate-200">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors overflow-hidden"
        >
          <div className="w-8 h-8 rounded-full bg-slate-300 shrink-0" />
          <div className="flex-1 text-left truncate">
            <p className="font-medium text-slate-900 truncate">User Account</p>
            <p className="text-xs text-slate-500 truncate">Settings</p>
          </div>
        </button>
      </div>
    </div>
  );
}
