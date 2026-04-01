import { Pressable, Text, View } from "react-native";

export type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tags: string[];
  isTrash: boolean;
};

type NoteListItemProps = {
  item: Note;
  onPress: (id: string) => void;
};

export function NoteListItem({ item, onPress }: NoteListItemProps) {
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
          {item.title}
        </Text>
        <Text className="text-[11px] font-bold text-slate-400 uppercase">
          {item.updatedAt}
        </Text>
      </View>
      <Text
        className="text-sm text-slate-500 leading-relaxed"
        numberOfLines={2}
      >
        {item.content}
      </Text>
    </Pressable>
  );
}
