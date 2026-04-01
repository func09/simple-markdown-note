import { useRouter, useSegments } from "expo-router";
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
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock Data (Synced with index)
const MOCK_NOTES: Record<string, { title: string; content: string }> = {
  "1": {
    title: "Shopping List",
    content: "# Shopping List\n\nMilk, eggs, bread, apples, bananas, please.",
  },
  "2": {
    title: "Project Ideas",
    content:
      "# Project Ideas\n\nProposal for a new web service. Using React, Next.js, and Tailwind.",
  },
  "3": {
    title: "Diary",
    content:
      "# Diary\n\nThe weather was nice today, so I took a walk in the park. The cherry blossoms were beautiful.",
  },
  "4": {
    title: "Meeting Notes",
    content:
      "# Meeting Notes\n\nConfirmation of the agenda for the next meeting. Discussing budget allocation.",
  },
};

export function NoteDetailScreen() {
  const segments = useSegments();
  const id = segments[segments.length - 1];
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [tags, setTags] = useState<string[]>(["Project", "React"]);
  const inputRef = useRef<TextInput>(null);

  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const charCount = useMemo(() => content.length, [content]);

  useEffect(() => {
    if (typeof id === "string" && MOCK_NOTES[id]) {
      setContent(MOCK_NOTES[id].content);
    } else if (id === "new") {
      setContent("");
    }
  }, [id]);

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
          <TouchableOpacity
            onPress={() => setShowInfo(!showInfo)}
            className="p-2 ml-1"
          >
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

      {/* Info Menu Overlay */}
      {showInfo && (
        <View
          className="absolute right-4 top-14 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <View className="p-4 border-b border-slate-50">
            <Text className="text-[11px] font-bold text-slate-400 uppercase mb-3">
              Note Details
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500">Words</Text>
                <Text className="text-xs font-medium text-slate-900">
                  {wordCount}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500">Characters</Text>
                <Text className="text-xs font-medium text-slate-900">
                  {charCount}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            className="flex-row items-center p-4 active:bg-red-50"
            onPress={() => {
              // Delete logic would go here
              setShowInfo(false);
              router.back();
            }}
          >
            <Trash2 size={18} color="#ef4444" />
            <Text className="text-sm font-semibold text-red-500 ml-3">
              Delete Note
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
    </SafeAreaView>
  );
}
