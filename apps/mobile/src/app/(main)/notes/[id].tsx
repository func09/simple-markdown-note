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

// ダミーデータ（一覧と同期）
const MOCK_NOTES: Record<string, { title: string; content: string }> = {
  "1": {
    title: "買い物リスト",
    content:
      "# 買い物リスト\n\n牛乳、卵、パン、リンゴ、バナナをおねがいします。",
  },
  "2": {
    title: "プロジェクトのアイデア",
    content:
      "# プロジェクトのアイデア\n\n新しいWebサービスの構成案。React, Next.js, Tailwindを使用。",
  },
  "3": {
    title: "日記",
    content:
      "# 日記\n\n今日は天気が良かったので公園を散歩した。桜が綺麗だった。",
  },
  "4": {
    title: "会議メモ",
    content:
      "# 会議メモ\n\n次回のミーティングのアジェンダ確認。予算配布について。",
  },
};

export default function NoteDetailScreen() {
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
          <Text className="text-slate-900 font-medium ml-1">戻る</Text>
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
            placeholder="ここに内容を入力..."
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
