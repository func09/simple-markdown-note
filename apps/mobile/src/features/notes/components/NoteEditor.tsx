import { Check, Tag, X } from "lucide-react-native";
import type { ReactNode, RefObject } from "react";
import {
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
import { getNodeText } from "../utils";

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
  bullet_list_icon: {
    marginLeft: 4,
    marginRight: 8,
    marginTop: 0,
    fontSize: 16,
    lineHeight: 16 * 1.6,
  },
  ordered_list_icon: {
    marginLeft: 4,
    marginRight: 8,
    marginTop: 0,
    fontSize: 16,
    lineHeight: 16 * 1.6,
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

interface NoteEditorProps {
  isPreview: boolean;
  content: string;
  setContent: (val: string) => void;
  isNew: boolean;
  inputRef: RefObject<TextInput | null>;
  tags: string[];
  onCheckboxToggle: (index: number) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}
/**
 * ノート本文の編集およびプレビュー状態を管理・表示するコンポーネント。
 * MarkdownのレンダリングやチェックボックスのON/OFF操作の他、タグ管理のUIも内包しています。
 */
export function NoteEditor({
  isPreview,
  content,
  setContent,
  isNew,
  inputRef,
  tags,
  onCheckboxToggle,
  onAddTag,
  onRemoveTag,
}: NoteEditorProps) {
  "use memo";
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
            onPress={() => onCheckboxToggle(currentIndex)}
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

      if (_parentNodes.some((p) => p.type === "bullet_list")) {
        return (
          <View key={node.key} style={styles.list_item as object}>
            <Text
              style={[
                styles.bullet_list_icon as object,
                { color: "#334155", fontWeight: "bold" },
              ]}
              accessible={false}
            >
              {Platform.select({
                android: "\u2022",
                ios: "\u00B7",
                default: "\u2022",
              })}
            </Text>
            <View style={{ flex: 1 }}>{children}</View>
          </View>
        );
      }

      const orderedListIndex = _parentNodes.findIndex(
        (p) => p.type === "ordered_list"
      );
      if (orderedListIndex > -1) {
        const orderedList = _parentNodes[orderedListIndex];
        let listItemNumber: number;
        if (orderedList.attributes?.start) {
          listItemNumber = orderedList.attributes.start + node.index;
        } else {
          listItemNumber = node.index + 1;
        }
        return (
          <View key={node.key} style={styles.list_item as object}>
            <Text
              style={[styles.ordered_list_icon as object, { color: "#334155" }]}
            >
              {listItemNumber}
              {node.markup}
            </Text>
            <View style={{ flex: 1 }}>{children}</View>
          </View>
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {isPreview ? (
          <View className="flex-1 p-6">
            {content ? (
              <Markdown style={markdownStyles} rules={markdownRules}>
                {content}
              </Markdown>
            ) : (
              <Text className="text-slate-300 italic">No content</Text>
            )}
          </View>
        ) : (
          <TextInput
            ref={inputRef}
            multiline
            placeholder="Enter content here..."
            placeholderTextColor="#cbd5e1"
            className="flex-1 p-6 text-lg text-slate-800 leading-relaxed text-left align-top"
            style={{ textAlignVertical: "top" }}
            value={content}
            onChangeText={setContent}
            autoFocus={isNew}
          />
        )}
      </ScrollView>

      <View className="px-4 py-3 border-t border-slate-100 bg-white flex-row items-center">
        <Tag size={16} color="#94a3b8" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="ml-2"
        >
          <View className="flex-row items-center space-x-2">
            {tags.map((tag) => (
              <View
                key={tag}
                className="bg-slate-100 px-3 py-1.5 rounded-full flex-row items-center"
              >
                <Text className="text-xs font-medium text-slate-600">
                  {tag}
                </Text>
                <TouchableOpacity
                  className="ml-1.5 p-0.5"
                  onPress={() => onRemoveTag(tag)}
                >
                  <X size={10} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              className="px-3 py-1.5 border border-dashed border-slate-300 rounded-full"
              onPress={onAddTag}
            >
              <Text className="text-xs font-medium text-slate-400">
                + Add Tag
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
