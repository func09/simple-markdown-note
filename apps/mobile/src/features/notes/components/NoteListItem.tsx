import type { Note } from "@simple-markdown-note/common/schemas";
import { Pressable, Text, View } from "react-native";

type NoteListItemProps = {
  item: Note;
  onPress: (id: string) => void;
};

export function NoteListItem({ item, onPress }: NoteListItemProps) {
  // 本文の1行目をタイトル、残りをサマリーとして抽出
  const lines = item.content.trim().split("\n");
  const title = lines[0] || "New Note";
  const summary =
    lines.slice(1).join(" ").trim() ||
    (item.content.length > title.length
      ? item.content.slice(title.length).trim()
      : "No additional content");

  // 日付の簡易フォーマット
  const date = new Date(item.updatedAt);
  const formattedDate = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      className="px-5 py-4 bg-white border-b border-slate-100 active:bg-slate-50"
    >
      <View className="flex-row justify-between items-start mb-1">
        <Text
          className="text-base font-semibold text-slate-900 flex-1 mr-2"
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text className="text-[11px] font-bold text-slate-400 uppercase">
          {formattedDate}
        </Text>
      </View>
      <Text
        className="text-sm text-slate-500 leading-relaxed"
        numberOfLines={2}
      >
        {summary}
      </Text>
    </Pressable>
  );
}
