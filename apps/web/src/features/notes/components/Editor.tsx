import {
  useDeleteNote,
  useNote,
  usePermanentDelete,
  useRestoreNote,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import { EditorContent } from "@tiptap/react";
import { Edit3 } from "lucide-react";
import { useRef, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import {
  useEditorPopovers,
  useNoteAutoSave,
  useNoteEditor,
  useNotesQueryString,
} from "../hooks";
import { EditorHeader } from "./EditorHeader";
import { EditorTagManager } from "./EditorTagManager";

const markdownComponents: Components = {
  p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
};

/**
 * Editorコンポーネントのプロパティ
 */
interface EditorProps {
  /** 編集対象のノートID（未選択時はundefined） */
  noteId?: string;
  /** 初期表示するマークダウンテキスト */
  initialContent?: string;
  /** モバイル表示時のレイアウト調整を行うかどうか */
  isMobile?: boolean;
}

/**
 * マークダウンエディタのインターフェースを提供するコンポーネント。
 * データ取得、自動保存、各種アクション（削除・復元・タグ更新）を統合・管理します。
 */
export function Editor({ noteId, isMobile }: EditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. 各種アクションとデータ取得の管理
  const queryString = useNotesQueryString();
  const { data: note, isLoading } = useNote(noteId ?? null, {
    enabled: !!noteId,
  });

  const navigate = useNavigate();
  const { mutateAsync: deleteNote } = useDeleteNote();
  const { mutateAsync: restoreNote } = useRestoreNote();
  const { mutate: updateNote } = useUpdateNote();
  const { mutateAsync: permanentDelete } = usePermanentDelete();

  /**
   * ノートをゴミ箱に移動（論理削除）し、ノート一覧に戻るハンドラー
   */
  const handleDelete = async () => {
    if (!noteId) return;
    await deleteNote(noteId);
    navigate(`/notes${queryString}`);
  };

  /**
   * ゴミ箱のノートを復元し、現在のページをリロード（再表示）するハンドラー
   */
  const handleRestore = async () => {
    if (!noteId) return;
    await restoreNote(noteId);
    navigate(`/notes/${noteId}${queryString}`);
  };

  /**
   * ノートのタグを更新するハンドラー
   */
  const handleUpdateTags = (newTags: string[]) => {
    if (!noteId) return;
    updateNote({
      id: noteId,
      data: { tags: newTags },
    });
  };

  /**
   * ノートをデータベースから完全に削除するハンドラー（確認ダイアログ付き）
   */
  const handlePermanentDelete = async () => {
    if (!noteId) return;
    if (
      window.confirm("Are you sure you want to delete this note permanently?")
    ) {
      setIsDeleting(true);
      await permanentDelete(noteId, {
        onSuccess: () => {
          navigate("/notes?scope=trash");
        },
      });
    }
  };

  // 2. ポップオーバーの管理
  const {
    isInfoOpen,
    setIsInfoOpen,
    isOptionsOpen,
    setIsOptionsOpen,
    infoRef,
    optionsRef,
  } = useEditorPopovers();

  // 3. オートセーブとエディタの管理 (Refを共有)
  const contentRef = useRef("");
  const lastNoteIdRef = useRef<string | null>(null);

  const { handleAutoSave } = useNoteAutoSave({
    noteId,
    noteContent: note?.content,
    isDeleting,
    contentRef,
    lastNoteIdRef,
  });

  const { editor } = useNoteEditor({
    note,
    isPreview,
    setIsPreview,
    onUpdate: handleAutoSave,
    contentRef,
    lastNoteIdRef,
  });

  if (!noteId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white h-full">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <Edit3 className="w-8 h-8 text-slate-200" />
        </div>
        <h3 className="text-lg font-medium text-slate-400">
          Select a note to start editing
        </h3>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex-1 bg-white animate-pulse" />;
  }

  const isTrashed = !!note?.deletedAt;
  const isTrashView = isTrashed;

  return (
    <div
      className={cn(
        "flex-1 flex flex-col bg-white h-full relative",
        isMobile && "fixed inset-0 z-50"
      )}
    >
      <EditorHeader
        note={note}
        editor={editor}
        isMobile={isMobile}
        isPreview={isPreview}
        setIsPreview={setIsPreview}
        queryString={queryString}
        isTrashView={isTrashView}
        isInfoOpen={isInfoOpen}
        setIsInfoOpen={setIsInfoOpen}
        isOptionsOpen={isOptionsOpen}
        setIsOptionsOpen={setIsOptionsOpen}
        infoRef={infoRef}
        optionsRef={optionsRef}
        handleDelete={handleDelete}
        handleRestore={handleRestore}
        handlePermanentDelete={handlePermanentDelete}
      />

      {/* Editor Content Area */}
      <div
        className={cn(
          "flex-1 overflow-y-auto custom-scrollbar",
          isPreview ? "bg-slate-50/50" : "bg-white"
        )}
      >
        {isPreview ? (
          <div className="prose prose-slate max-w-none px-8 py-12 animate-in fade-in duration-300 font-sans prose-p:my-0 prose-headings:mb-2 prose-headings:mt-6 prose-ul:my-2 prose-li:my-0 prose-ol:my-2">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {contentRef.current || ""}
            </ReactMarkdown>
          </div>
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      <EditorTagManager
        note={note}
        isTrashed={isTrashed}
        handleUpdateTags={handleUpdateTags}
      />
    </div>
  );
}
