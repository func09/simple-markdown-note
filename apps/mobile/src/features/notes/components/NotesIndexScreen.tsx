import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Menu,
  NotebookPen,
  Search,
  Tag as TagIcon,
  Trash2,
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;

// Mock Data
const MOCK_NOTES = [
  {
    id: "1",
    title: "Shopping List",
    content:
      "Milk, eggs, bread, apples, bananas, please. Also, don't forget to buy chicken and cabbage for dinner. We also need cereal for tomorrow breakfast.",
    updatedAt: "10:30",
    tags: ["Free"],
    isTrash: false,
  },
  {
    id: "2",
    title: "Project Ideas",
    content:
      "Proposal for a new web service. Using React, Next.js, and Tailwind, with Expo Router for the mobile app. Aiming for an offline-first design using IndexedDB.",
    updatedAt: "Yesterday",
    tags: ["Test", "User"],
    isTrash: false,
  },
  {
    id: "3",
    title: "Diary",
    content:
      "The weather was nice today, so I took a walk in the park. The cherry blossoms were beautiful. On the way back, I stopped at a cafe and finished a book I've been reading. It was a very fulfilling day.",
    updatedAt: "Mar 28",
    tags: ["User"],
    isTrash: false,
  },
  {
    id: "4",
    title: "Meeting Notes",
    content:
      "Confirmation of the agenda for the next meeting. Discussing budget allocation. We plan to discuss progress reports from each department, Q2 KPI settings, and the formulation of a new marketing strategy.",
    updatedAt: "Mar 25",
    tags: ["Test"],
    isTrash: true,
  },
];

const MOCK_TAGS = ["Test", "User", "Free"];

export function NotesIndexScreen() {
  const router = useRouter();
  const { scope, tag } = useLocalSearchParams<{
    scope?: string;
    tag?: string;
  }>();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const toggleDrawer = (open: boolean) => {
    setIsDrawerOpen(open);
    Animated.timing(slideAnim, {
      toValue: open ? 0 : -DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const filteredNotes = MOCK_NOTES.filter((note) => {
    // Search query filter
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Scope/Tag filter
    if (scope === "trash") return note.isTrash;
    if (note.isTrash && scope !== "trash") return false; // Hide trash by default

    if (scope === "untagged") return note.tags.length === 0;
    if (tag) return note.tags.includes(tag);

    return true;
  });

  const getHeaderTitle = () => {
    if (tag) return tag;
    if (scope === "trash") return "Trash";
    if (scope === "untagged") return "Untagged";
    return "All Notes";
  };

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
      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <TouchableWithoutFeedback onPress={() => toggleDrawer(false)}>
          <View
            className="absolute inset-0 bg-black/40 z-40"
            style={{ height: Dimensions.get("window").height }}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Side Drawer */}
      <Animated.View
        className="absolute left-0 top-0 bottom-0 bg-white z-50 shadow-2xl"
        style={{
          width: DRAWER_WIDTH,
          transform: [{ translateX: slideAnim }],
        }}
      >
        <SafeAreaView className="flex-1">
          <View className="flex-1 pt-6">
            {/* Main Links */}
            <View className="px-2 mb-6">
              <TouchableOpacity
                onPress={() => {
                  toggleDrawer(false);
                  router.setParams({ scope: "all", tag: undefined });
                }}
                className={`flex-row items-center px-4 py-3 rounded-xl ${
                  (!scope || scope === "all") && !tag ? "bg-blue-50" : ""
                }`}
              >
                <NotebookPen
                  size={20}
                  color={
                    (!scope || scope === "all") && !tag ? "#3b82f6" : "#475569"
                  }
                />
                <Text
                  className={`ml-4 text-sm font-semibold ${
                    (!scope || scope === "all") && !tag
                      ? "text-blue-600"
                      : "text-slate-600"
                  }`}
                >
                  All Notes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  toggleDrawer(false);
                  router.setParams({ scope: "trash", tag: undefined });
                }}
                className={`flex-row items-center px-4 py-3 rounded-xl mt-1 ${
                  scope === "trash" ? "bg-slate-100" : ""
                }`}
              >
                <Trash2
                  size={20}
                  color={scope === "trash" ? "#0f172a" : "#475569"}
                />
                <Text
                  className={`ml-4 text-sm font-semibold ${
                    scope === "trash" ? "text-slate-900" : "text-slate-600"
                  }`}
                >
                  Trash
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tags Section */}
            <View className="px-6 mb-2">
              <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Tags
              </Text>
            </View>
            <View className="px-2">
              {MOCK_TAGS.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => {
                    toggleDrawer(false);
                    router.setParams({ tag: t, scope: undefined });
                  }}
                  className={`flex-row items-center px-4 py-2.5 rounded-xl ${
                    tag === t ? "bg-blue-50" : ""
                  }`}
                >
                  <TagIcon
                    size={16}
                    color={tag === t ? "#3b82f6" : "#94a3b8"}
                  />
                  <Text
                    className={`ml-4 text-sm font-medium ${
                      tag === t ? "text-blue-600" : "text-slate-600"
                    }`}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bottom Section */}
            <View className="mt-auto px-2 pb-6 border-t border-slate-50 pt-4">
              <TouchableOpacity
                onPress={() => {
                  toggleDrawer(false);
                  router.setParams({ scope: "untagged", tag: undefined });
                }}
                className={`flex-row items-center px-4 py-3 rounded-xl ${
                  scope === "untagged" ? "bg-blue-50" : ""
                }`}
              >
                <TagIcon
                  size={18}
                  color={scope === "untagged" ? "#3b82f6" : "#64748b"}
                  className="rotate-90"
                />
                <Text
                  className={`ml-4 text-sm font-medium ${
                    scope === "untagged" ? "text-blue-600" : "text-slate-500"
                  }`}
                >
                  Untagged Notes...
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

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
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-10 mt-20">
            <View className="w-16 h-16 bg-slate-50 items-center justify-center rounded-full mb-4">
              <Search size={24} color="#cbd5e1" />
            </View>
            <Text className="text-slate-400 font-medium">No notes found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
