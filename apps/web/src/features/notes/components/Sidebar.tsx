import { useTags } from "@simple-markdown-note/api-client/hooks";
import { FileText, Hash, Settings, Trash2 } from "lucide-react";
import type { ElementType } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { SettingsModal } from "@/features/settings/components/SettingsModal";
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
  "use memo";
  return (
    <Link
      to={href}
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
/**
 * アプリの全体メニューを提供するナビゲーションサイドバー。
 * 「すべてのノート」「ゴミ箱」のリンクや、登録されているタグによるフィルタリング機能を提供します。
 */
export function Sidebar({ onClose }: SidebarProps) {
  "use memo";
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { filterScope, filterTag, setFilterScope, setFilterTag } =
    useNotesStore();
  const { data: tags = [], isLoading } = useTags();

  const handleAllNotes = () => {
    setFilterScope("all");
    onClose?.();
  };

  const handleTrash = () => {
    setFilterScope("trash");
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 w-full overflow-y-auto custom-scrollbar">
      {/* App Logo / Title */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <img
            src="/icons/icon.svg"
            alt="Simple Markdown Note"
            className="w-8 h-8 rounded-lg"
          />
          <div className="flex flex-col">
            <span>Simple Markdown Note</span>
            {import.meta.env.VITE_APP_VERSION && (
              <span className="text-[10px] font-normal text-slate-400 mt-0.5">
                v{import.meta.env.VITE_APP_VERSION}
              </span>
            )}
          </div>
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

      {/* Settings Section */}
      <div className="p-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}
