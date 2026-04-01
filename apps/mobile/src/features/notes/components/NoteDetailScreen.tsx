import { useLocalSearchParams, useRouter } from "expo-router";
import {
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
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock Data (Synced with index)
const MOCK_NOTES: Record<
  string,
  { title: string; content: string; createdAt: Date; updatedAt: Date }
> = {
  "1": {
    title: "Shopping List",
    content: "# Shopping List\n\nMilk, eggs, bread, apples, bananas, please.",
    createdAt: new Date("2026-03-20T10:00:00"),
    updatedAt: new Date("2026-03-28T14:30:00"),
  },
  "2": {
    title: "Project Ideas",
    content:
      "# Project Ideas\n\nProposal for a new web service. Using React, Next.js, and Tailwind.",
    createdAt: new Date("2026-03-15T09:00:00"),
    updatedAt: new Date("2026-03-29T11:00:00"),
  },
  "3": {
    title: "Diary",
    content:
      "# Diary\n\nThe weather was nice today, so I took a walk in the park. The cherry blossoms were beautiful.",
    createdAt: new Date("2026-03-26T01:15:00"),
    updatedAt: new Date("2026-04-01T01:56:00"),
  },
  "4": {
    title: "Meeting Notes",
    content:
      "# Meeting Notes\n\nConfirmation of the agenda for the next meeting. Discussing budget allocation.",
    createdAt: new Date("2026-03-22T08:00:00"),
    updatedAt: new Date("2026-03-30T16:00:00"),
  },
};

function formatDate(date: Date): string {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(400)).current;
  const [tags, setTags] = useState<string[]>(["Project", "React"]);
  const inputRef = useRef<TextInput>(null);

  const note = typeof id === "string" ? MOCK_NOTES[id] : undefined;

  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const charCount = useMemo(() => content.length, [content]);

  useEffect(() => {
    if (note) {
      setContent(note.content);
    } else if (id === "new") {
      setContent("");
    }
  }, [id, note]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const openInfo = () => {
    setIsInfoVisible(true);
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeInfo = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 400,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setIsInfoVisible(false));
  };

  const handleKeyboardToggle = () => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
    } else {
      if (isPreview) setIsPreview(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Custom Header */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-slate-100 bg-white z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center p-2 -ml-2"
        >
          <ChevronLeft size={24} color="#0f172a" />
          <Text className="text-slate-900 font-medium ml-1">Back</Text>
        </TouchableOpacity>

        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={() => setIsPreview(!isPreview)}
            className="p-2"
            activeOpacity={0.7}
          >
            {isPreview ? (
              <EyeOff size={22} color="#475569" />
            ) : (
              <Eye size={22} color="#475569" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={openInfo} className="p-2 ml-1">
            <Info size={22} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleKeyboardToggle}
            className="p-2 -mr-1"
          >
            {isKeyboardVisible ? (
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
          {isPreview ? (
            <View className="flex-1 p-6">
              <Text className="text-lg text-slate-800 leading-relaxed">
                {content || (
                  <Text className="text-slate-300 italic">No content</Text>
                )}
              </Text>
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
              autoFocus={id === "new"}
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
                    onPress={() => setTags(tags.filter((t) => t !== tag))}
                  >
                    <X size={10} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity className="px-3 py-1.5 border border-dashed border-slate-300 rounded-full">
                <Text className="text-xs font-medium text-slate-400">
                  + Add Tag
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Info Bottom Sheet */}
      <Modal
        visible={isInfoVisible}
        transparent
        animationType="none"
        onRequestClose={closeInfo}
      >
        <Pressable className="flex-1" onPress={closeInfo}>
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.2)",
              opacity: overlayOpacity,
            }}
            pointerEvents="none"
          />
        </Pressable>
        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl pb-10"
          style={{ transform: [{ translateY: sheetTranslateY }] }}
        >
          <Pressable onPress={() => {}}>
            {/* Handle */}
            <View className="items-center pt-3 pb-4">
              <View className="w-10 h-1 rounded-full bg-slate-300" />
            </View>

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
                    <Text className="text-base text-slate-800">Created at</Text>
                    <Text className="text-base text-slate-400">
                      {formatDate(note.createdAt)}
                    </Text>
                  </View>
                </>
              )}
              <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
                <Text className="text-base text-slate-800">Words</Text>
                <Text className="text-base text-slate-400">{wordCount}</Text>
              </View>
              <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
                <Text className="text-base text-slate-800">Characters</Text>
                <Text className="text-base text-slate-400">{charCount}</Text>
              </View>
            </View>

            {/* Actions */}
            <TouchableOpacity
              className="flex-row items-center px-5 py-4"
              onPress={() => {
                closeInfo();
                setTimeout(() => router.back(), 250);
              }}
            >
              <Trash2 size={20} color="#ef4444" />
              <Text className="text-base text-red-500 ml-3">Move to Trash</Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}
