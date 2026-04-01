import { useRouter } from "expo-router";
import { NotebookPen, Plus, Search } from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock Data
const MOCK_NOTES = [
  {
    id: "1",
    title: "Shopping List",
    content:
      "Milk, eggs, bread, apples, bananas, please. Also, don't forget to buy chicken and cabbage for dinner. We also need cereal for tomorrow breakfast.",
    updatedAt: "10:30",
  },
  {
    id: "2",
    title: "Project Ideas",
    content:
      "Proposal for a new web service. Using React, Next.js, and Tailwind, with Expo Router for the mobile app. Aiming for an offline-first design using IndexedDB.",
    updatedAt: "Yesterday",
  },
  {
    id: "3",
    title: "Diary",
    content:
      "The weather was nice today, so I took a walk in the park. The cherry blossoms were beautiful. On the way back, I stopped at a cafe and finished a book I've been reading. It was a very fulfilling day.",
    updatedAt: "Mar 28",
  },
  {
    id: "4",
    title: "Meeting Notes",
    content:
      "Confirmation of the agenda for the next meeting. Discussing budget allocation. We plan to discuss progress reports from each department, Q2 KPI settings, and the formulation of a new marketing strategy.",
    updatedAt: "Mar 25",
  },
];

export function NotesIndexScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const renderItem = ({ item }: { item: (typeof MOCK_NOTES)[0] }) => (
    <Pressable
      onPress={() => router.push(`/(main)/notes/${item.id}`)}
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 py-4 border-b border-slate-100 bg-white">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-slate-900">All Notes</Text>
          <TouchableOpacity className="p-2 -mr-2">
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
        data={MOCK_NOTES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-10 mt-20">
            <View className="w-16 h-16 bg-slate-50 items-center justify-center rounded-full mb-4">
              <Search size={24} color="#cbd5e1" />
            </View>
            <Text className="text-slate-400 font-medium">No notes found</Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push("/(main)/notes/new")}
        className="absolute right-6 bottom-8 w-14 h-14 bg-slate-900 rounded-full items-center justify-center shadow-xl shadow-slate-400"
      >
        <Plus size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
