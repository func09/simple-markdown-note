import { Notes } from "@/features/notes";

interface NotesPageProps {
  searchParams: Promise<{
    scope?: string;
    tag?: string;
  }>;
}

/**
 * ノート一覧ページ (Server Component)
 * クエリパラメータ (scope, tag) に基づいてノートを表示します。
 */
export default async function NotesPage({ searchParams }: NotesPageProps) {
  const { scope, tag } = await searchParams;

  // デフォルトスコープは "all"
  const currentScope = scope || "all";

  return (
    <div className="h-full w-full">
      <Notes
        context={
          tag
            ? { type: "tag", value: tag }
            : { type: "scope", value: currentScope }
        }
      />
    </div>
  );
}
