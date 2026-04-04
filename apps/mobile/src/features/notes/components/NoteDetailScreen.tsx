import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useNote } from "@simple-markdown-note/api-client/hooks";
import { useLocalSearchParams } from "expo-router";
import {
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  Info,
  Keyboard as KeyboardIcon,
  SquarePen,
  Tag,
  Trash2,
  X,
} from "lucide-react-native";
import { type ReactNode, useCallback } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown, {
  type ASTNode,
  type RenderRules,
} from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useNoteEditorState,
  useNoteMetrics,
  useNoteOperations,
  useNoteUIController,
} from "../hooks";
import { formatDate, getNodeText } from "../utils";

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 16 * 1.6,
    color: "#334155", // slate-700
  },
  heading1: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a", // slate-900
    marginVertical: 10,
  },
  heading2: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginVertical: 8,
  },
  heading3: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginVertical: 6,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 16 * 1.6,
    color: "#334155",
    marginBottom: 8,
  },
  list_item: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
  code_inline: {
    backgroundColor: "#f1f5f9", // slate-100
    color: "#475569", // slate-600
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  code_block: {
    backgroundColor: "#1e293b", // slate-800
    color: "#f8fafc", // slate-50
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  fence: {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: "#cbd5e1", // slate-300
    paddingLeft: 12,
    marginVertical: 8,
    fontStyle: "italic",
  },
  link: {
    color: "#3b82f6", // blue-500
    textDecorationLine: "underline",
  },
});

export function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";

  // 1. UI制御
  const ui = useNoteUIController();

  // 2. データ取得
  const { data: note, isLoading } = useNote(isNew ? null : id);

  // 3. 編集状態
  const editor = useNoteEditorState(isNew, note);

  // 4. 計算
  const metrics = useNoteMetrics(editor.content);

  // 5. 操作（保存・削除）
  const ops = useNoteOperations({
    isNew,
    content: editor.content,
    tags: editor.tags,
    currentNoteId: editor.currentNoteId,
    initializedId: editor.initializedId,
    infoSheetRef: ui.infoSheetRef,
    handleGoBack: ui.handleGoBack,
    note,
    isLoading,
  });

  const insets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.2}
      />
    ),
    []
  );

  let checkboxCount = 0;
  const markdownRules: RenderRules = {
    list_item: (
      node: ASTNode,
      children: ReactNode[],
      _parentNodes: ASTNode[],
      styles: Record<string, unknown>
    ) => {
      const rawText = getNodeText(node);
      const checkboxMatch = rawText.match(/^\[( |x|X)\]\s*([\s\S]*)/);
      if (checkboxMatch) {
        const isChecked = checkboxMatch[1].toLowerCase() === "x";
        const itemText = checkboxMatch[2];
        const currentIndex = checkboxCount++;
        return (
          <TouchableOpacity
            key={node.key}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: 6,
              paddingVertical: 2,
            }}
            onPress={() => editor.handleCheckboxToggle(currentIndex)}
            activeOpacity={0.6}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: isChecked ? "#3b82f6" : "#94a3b8",
                backgroundColor: isChecked ? "#3b82f6" : "transparent",
                marginRight: 10,
                marginTop: 2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isChecked && <Check size={12} color="white" />}
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                lineHeight: 16 * 1.6,
                color: isChecked ? "#94a3b8" : "#334155",
                textDecorationLine: isChecked ? "line-through" : "none",
              }}
            >
              {itemText}
            </Text>
          </TouchableOpacity>
        );
      }
      return (
        <View key={node.key} style={styles.list_item as object}>
          {children}
        </View>
      );
    },
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Custom Header */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-slate-100 bg-white z-10">
        <TouchableOpacity
          onPress={ui.handleGoBack}
          className="flex-row items-center p-2 -ml-2"
        >
          <ChevronLeft size={24} color="#0f172a" />
          <Text className="text-slate-900 font-medium ml-1">Back</Text>
        </TouchableOpacity>

        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={() => ui.setIsPreview(!ui.isPreview)}
            className="p-2"
            activeOpacity={0.7}
          >
            {ui.isPreview ? (
              <EyeOff size={22} color="#475569" />
            ) : (
              <Eye size={22} color="#475569" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              ui.infoSheetRef.current?.present();
            }}
            className="p-2 ml-1"
          >
            <Info size={22} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={ui.handleKeyboardToggle}
            className="p-2 -mr-1"
          >
            {ui.isKeyboardVisible ? (
              <KeyboardIcon size={22} color="#3b82f6" />
            ) : (
              <SquarePen size={22} color="#475569" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 bg-white"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {ui.isPreview ? (
            <View className="flex-1 p-6">
              {editor.content ? (
                <Markdown style={markdownStyles} rules={markdownRules}>
                  {editor.content}
                </Markdown>
              ) : (
                <Text className="text-slate-300 italic">No content</Text>
              )}
            </View>
          ) : (
            <TextInput
              ref={ui.inputRef}
              multiline
              placeholder="Enter content here..."
              placeholderTextColor="#cbd5e1"
              className="flex-1 p-6 text-lg text-slate-800 leading-relaxed text-left align-top"
              style={{ textAlignVertical: "top" }}
              value={editor.content}
              onChangeText={editor.setContent}
              autoFocus={isNew}
            />
          )}
        </ScrollView>

        {/* Tags Section */}
        <View className="px-4 py-3 border-t border-slate-100 bg-white flex-row items-center">
          <Tag size={16} color="#94a3b8" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="ml-2"
          >
            <View className="flex-row items-center space-x-2">
              {editor.tags.map((tag) => (
                <View
                  key={tag}
                  className="bg-slate-100 px-3 py-1.5 rounded-full flex-row items-center"
                >
                  <Text className="text-xs font-medium text-slate-600">
                    {tag}
                  </Text>
                  <TouchableOpacity
                    className="ml-1.5 p-0.5"
                    onPress={() => editor.handleRemoveTag(tag)}
                  >
                    <X size={10} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                className="px-3 py-1.5 border border-dashed border-slate-300 rounded-full"
                onPress={() => editor.handleAddTag(editor.tags)}
              >
                <Text className="text-xs font-medium text-slate-400">
                  + Add Tag
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Info Bottom Sheet */}
      <BottomSheetModal
        ref={ui.infoSheetRef}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView>
          {/* Info Rows */}
          <View className="border-t border-slate-100">
            {note && (
              <>
                <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
                  <Text className="text-base text-slate-800">Updated at</Text>
                  <Text className="text-base text-slate-400">
                    {formatDate(note.updatedAt)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
                  <Text className="text-base text-slate-800">Note ID</Text>
                  <Text
                    className="text-base text-slate-400 truncate ml-4"
                    numberOfLines={1}
                  >
                    {note.id}
                  </Text>
                </View>
              </>
            )}
            <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
              <Text className="text-base text-slate-800">Words</Text>
              <Text className="text-base text-slate-400">
                {metrics.wordCount}
              </Text>
            </View>
            <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
              <Text className="text-base text-slate-800">Characters</Text>
              <Text className="text-base text-slate-400">
                {metrics.charCount}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="mb-6">
            <TouchableOpacity
              className="flex-row items-center px-5 py-4 border-b border-slate-50"
              onPress={ops.handleTrashAction}
            >
              <Trash2
                size={20}
                color={note?.deletedAt ? "#3b82f6" : "#ef4444"}
              />
              <Text
                className={`text-base ml-3 ${
                  note?.deletedAt ? "text-blue-500" : "text-red-500"
                }`}
              >
                {note?.deletedAt ? "Restore from Trash" : "Move to Trash"}
              </Text>
            </TouchableOpacity>

            {note?.deletedAt && (
              <TouchableOpacity
                className="flex-row items-center px-5 py-4"
                onPress={ops.handlePermanentDelete}
              >
                <X size={20} color="#ef4444" />
                <Text className="text-base text-red-500 ml-3">
                  Permanently Delete
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
