import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeyboardObserver, useNoteEditor, useTagPrompt } from "../hooks";
import { executeNoteDelete, toggleCheckboxInContent } from "../utils";
import { NoteEditor } from "./NoteEditor";
import { NoteInfoSheet } from "./NoteInfoSheet";
import { NoteToolbar } from "./NoteToolbar";

export function NoteDetailScreen() {
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
  const handleTrashAction = useCallback(() => {
    const activeId = currentNoteId.current;
    if (!activeId) return;
    const action = note?.deletedAt
      ? () => mutations.restoreNote(activeId)
      : () => mutations.deleteNote(activeId);
    return executeNoteDelete(
      action,
      note?.deletedAt ? "restore note" : "trash note",
      { setIsDeleting, infoSheetRef: uiLayout.infoSheetRef, handleGoBack }
    );
  }, [
    currentNoteId,
    note,
    mutations,
    setIsDeleting,
    uiLayout.infoSheetRef,
    handleGoBack,
  ]);

  // 完全に削除
  const handlePermanentDelete = useCallback(() => {
    const activeId = currentNoteId.current;
    if (!activeId) return;
    return executeNoteDelete(
      () => mutations.permanentDelete(activeId),
      "permanently delete note",
      { setIsDeleting, infoSheetRef: uiLayout.infoSheetRef, handleGoBack }
    );
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
