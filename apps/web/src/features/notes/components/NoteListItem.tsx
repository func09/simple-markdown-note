import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatDate } from "../utils";

interface NoteListItemProps {
  note: {
    id: string;
    content: string;
    updatedAt: string;
  };
  isSelected: boolean;
  href: string;
  onClick: (id: string) => void;
}

function formatNotePreview(content: string) {
  const lines = content.split("\n");
  const title = lines[0].replace(/^#\s*/, "").trim() || "Untitled";
  const preview = lines.slice(1).join(" ").trim() || "No additional text";
  return { title, preview };
}

export function NoteListItem({
  note,
  isSelected,
  href,
  onClick,
}: NoteListItemProps) {
  const { title, preview } = formatNotePreview(note.content);

  return (
    <Link
      to={href}
      onClick={() => onClick(note.id)}
      className={cn(
        "block px-5 py-4 transition-colors text-left",
        isSelected
          ? "bg-slate-100 ring-1 ring-inset ring-slate-200"
          : "hover:bg-slate-50"
      )}
    >
      <div className="flex justify-between items-start mb-1 gap-2">
        <h3 className="text-sm font-semibold text-slate-900 truncate flex-1">
          {title}
        </h3>
        <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap">
          {formatDate(note.updatedAt)}
        </span>
      </div>
      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
        {preview}
      </p>
    </Link>
  );
}

NoteListItem.displayName = "NoteListItem";
