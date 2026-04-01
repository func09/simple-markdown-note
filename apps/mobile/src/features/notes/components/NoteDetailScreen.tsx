import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Share, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
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
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [content, setContent] = useState("");

  useEffect(() => {
    if (typeof id === "string" && MOCK_NOTES[id]) {
      setContent(MOCK_NOTES[id].content);
    } else if (id === "new") {
      setContent("");
    }
  }, [id]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Custom Header */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center p-2 -ml-2"
        >
          <ChevronLeft size={24} color="#0f172a" />
          <Text className="text-slate-900 font-medium ml-1">Back</Text>
        </TouchableOpacity>

        <View className="flex-row items-center">
          <TouchableOpacity className="p-2">
            <Share size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2 ml-2">
            <Trash2 size={20} color="#ef4444" />
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
          <TextInput
            multiline
            placeholder="Enter content here..."
            placeholderTextColor="#cbd5e1"
            className="flex-1 p-6 text-lg text-slate-800 leading-relaxed text-left align-top"
            style={{ textAlignVertical: "top" }}
            value={content}
            onChangeText={setContent}
            autoFocus={id === "new"}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
