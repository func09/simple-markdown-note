import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NAVIGATION_DELAY } from "../constants";
import { useKeyboardObserver, useNoteEditor, useTagPrompt } from "../hooks";
import { toggleCheckboxInContent } from "../utils";
import { NoteEditor } from "./NoteEditor";
import { NoteInfoSheet } from "./NoteInfoSheet";
import { NoteToolbar } from "./NoteToolbar";
/**
 * 個別のノート詳細情報や編集機能を提供する画面コンポーネント。
 * ルーティングのパラメータからノートIDを取得し、ノートのプレビューや編集、削除などの操作を統括します。
 */
export function NoteDetailScreen() {
  "use memo";
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();

  // ドメインロジック（ノートの取得・保存・状態管理）
  const {
    note,
    mutations,
    metrics,
    content,
    setContent,
    tags,
    setTags,
    isPreview,
    setIsPreview,
    setIsDeleting,
    currentNoteId,
  } = useNoteEditor(id, isNew);

  // プラットフォーム固有のUI制御（キーボード、タグ入力モーダルなど）
  const uiLayout = useKeyboardObserver(isPreview, setIsPreview);
  const { promptForTag } = useTagPrompt();

  const handleGoBack = useCallback(() => router.back(), [router]);

  // イベントハンドラー
  // マークダウン内のチェックボックス切り替え
  const handleCheckboxToggle = useCallback(
    (index: number) => {
      setContent((prev) => toggleCheckboxInContent(prev, index));
    },
    [setContent]
  );

  // タグの追加プロンプトを表示
  const handleAddTag = useCallback(() => {
    promptForTag(tags, (newTag) => setTags((prev) => [...prev, newTag]));
  }, [promptForTag, tags, setTags]);

  // タグの削除
  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      setTags((prev) => prev.filter((t) => t !== tagToRemove));
    },
    [setTags]
  );

  // ゴミ箱への移動、または復元
  const handleTrashAction = useCallback(async () => {
    const activeId = currentNoteId.current;
    if (!activeId) return;
    const action = note?.deletedAt
      ? () => mutations.restoreNote(activeId)
      : () => mutations.deleteNote(activeId);

    setIsDeleting(true);
    try {
      await action();
      uiLayout.infoSheetRef.current?.dismiss();
      setTimeout(handleGoBack, NAVIGATION_DELAY);
    } catch (error) {
      setIsDeleting(false);
      console.error(
        `Failed to ${note?.deletedAt ? "restore note" : "trash note"}:`,
        error
      );
    }
  }, [
    currentNoteId,
    note,
    mutations,
    setIsDeleting,
    uiLayout.infoSheetRef,
    handleGoBack,
  ]);

  // 完全に削除
  const handlePermanentDelete = useCallback(async () => {
    const activeId = currentNoteId.current;
    if (!activeId) return;

    setIsDeleting(true);
    try {
      await mutations.permanentDelete(activeId);
      uiLayout.infoSheetRef.current?.dismiss();
      setTimeout(handleGoBack, NAVIGATION_DELAY);
    } catch (error) {
      setIsDeleting(false);
      console.error("Failed to permanently delete note:", error);
    }
  }, [
    currentNoteId,
    mutations,
    setIsDeleting,
    uiLayout.infoSheetRef,
    handleGoBack,
  ]);

  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <NoteToolbar
        isPreview={isPreview}
        setIsPreview={setIsPreview}
        isKeyboardVisible={uiLayout.isKeyboardVisible}
        onGoBack={handleGoBack}
        onOpenInfo={() => uiLayout.infoSheetRef.current?.present()}
        onToggleKeyboard={uiLayout.handleKeyboardToggle}
      />

      <NoteEditor
        isPreview={isPreview}
        content={content}
        setContent={setContent}
        isNew={isNew}
        inputRef={uiLayout.inputRef}
        tags={tags}
        onCheckboxToggle={handleCheckboxToggle}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />

      <NoteInfoSheet
        sheetRef={uiLayout.infoSheetRef}
        note={note}
        metrics={metrics}
        onTrashAction={handleTrashAction}
        onPermanentDelete={handlePermanentDelete}
      />
    </View>
  );
}
