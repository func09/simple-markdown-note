import { Menu, NotebookPen, Search } from "lucide-react-native";
import {
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNoteListController } from "../hooks";
import { NoteDrawer } from "./NoteDrawer";
import { NoteListItem } from "./NoteListItem";

export function NotesIndexScreen() {
  const {
    notes: filteredNotes,
    isNotesLoading,
    refetchNotes,
    tags,
    searchQuery,
    setSearchQuery,
    isDrawerOpen,
    toggleDrawer,
    slideAnim,
    scope,
    tag,
    getHeaderTitle,
    handleSelectScope,
    handleSelectTag,
    handleNewNote,
    handleSelectNote,
  } = useNoteListController();

  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
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
          <TouchableOpacity onPress={handleNewNote} className="p-2 -mr-2">
            <NotebookPen size={22} color="#0f172a" />
          </TouchableOpacity>
        </View>

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

      <FlatList
        data={filteredNotes}
        renderItem={({ item }) => (
          <NoteListItem item={item} onPress={handleSelectNote} />
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
    </View>
  );
}
