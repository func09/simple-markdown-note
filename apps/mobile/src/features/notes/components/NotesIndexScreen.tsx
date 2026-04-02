import { useNotes, useTags } from "api-client/hooks";
import { NOTE_SCOPE } from "common/constraints";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Menu, NotebookPen, Search } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DRAWER_WIDTH, NoteDrawer } from "./NoteDrawer";
import { NoteListItem } from "./NoteListItem";

export function NotesIndexScreen() {
  const router = useRouter();
  const { scope = NOTE_SCOPE.ALL, tag } = useLocalSearchParams<{
    scope?: string;
    tag?: string;
  }>();

  // API からノート一覧とタグ一覧を取得
  const {
    data: notes = [],
    isLoading: isNotesLoading,
    refetch: refetchNotes,
  } = useNotes({
    scope: scope as import("common/constraints").NoteScope,
    tag,
  });
  const { data: apiTags = [] } = useTags();
  const tags = apiTags.map((t) => t.name);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const toggleDrawer = (open: boolean) => {
    if (open) setIsDrawerOpen(true);
    Animated.timing(slideAnim, {
      toValue: open ? 0 : -DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!open && finished) {
        setIsDrawerOpen(false);
      }
    });
  };

  const filteredNotes = notes.filter((note) => {
    // 検索クエリによるフィルタリング（API が未対応のためローカルで実施）
    const matchesSearch = note.content
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getHeaderTitle = () => {
    if (tag) return tag;
    if (scope === NOTE_SCOPE.TRASH) return "Trash";
    if (scope === NOTE_SCOPE.UNTAGGED) return "Untagged";
    return "All Notes";
  };

  const handleSelectScope = (newScope: string) => {
    toggleDrawer(false);
    router.setParams({ scope: newScope, tag: undefined });
  };

  const handleSelectTag = (newTag: string) => {
    toggleDrawer(false);
    router.setParams({ tag: newTag, scope: undefined });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Side Drawer Component */}
      <NoteDrawer
        isOpen={isDrawerOpen}
        onClose={() => toggleDrawer(false)}
        slideAnim={slideAnim}
        scope={scope}
        tag={tag}
        onSelectScope={handleSelectScope}
        onSelectTag={handleSelectTag}
        tags={tags}
      />

      {/* Header */}
      <View className="px-5 py-4 border-b border-slate-100 bg-white">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => toggleDrawer(true)}
              className="p-2 -ml-2 mr-1"
            >
              <Menu size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-slate-900">
              {getHeaderTitle()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(main)/notes/new")}
            className="p-2 -mr-2"
          >
            <NotebookPen size={22} color="#0f172a" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-11">
          <Search size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search notes..."
            placeholderTextColor="#94a3b8"
            className="flex-1 ml-2 text-slate-900 text-sm"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Note List */}
      <FlatList
        data={filteredNotes}
        renderItem={({ item }) => (
          <NoteListItem
            item={item}
            onPress={(id) => router.push(`/(main)/notes/${id}`)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isNotesLoading}
            onRefresh={refetchNotes}
          />
        }
        ListEmptyComponent={
          !isNotesLoading ? (
            <View className="flex-1 items-center justify-center p-10 mt-20">
              <View className="w-16 h-16 bg-slate-50 items-center justify-center rounded-full mb-4">
                <Search size={24} color="#cbd5e1" />
              </View>
              <Text className="text-slate-400 font-medium">No notes found</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
