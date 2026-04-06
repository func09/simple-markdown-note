import { StatusBar } from "expo-status-bar";
import { NotebookPen } from "lucide-react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
/**
 * 未ログイン時のランディングページとして機能するホーム画面コンポーネント。
 * アプリのロゴと簡潔な説明を表示します。
 */
export function HomeScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 bg-slate-50"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <StatusBar style="dark" />

      <View className="flex-1 items-center justify-center px-6">
        {/* Logo/Icon Section */}
        <View className="mb-8 items-center justify-center rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <NotebookPen size={64} color="#3b82f6" strokeWidth={1.5} />
        </View>

        {/* Text Section */}
        <View className="items-center">
          <Text className="mb-2 text-4xl font-bold tracking-tight text-slate-900 text-center">
            Simple Markdown Note
          </Text>
          <Text className="text-center text-lg leading-6 text-slate-500">
            The simplest way to keep notes.{"\n"}
            Light, clean, and free.
          </Text>
        </View>
      </View>

      {/* Footer Info */}
      <View className="pb-8 items-center">
        <Text className="text-sm font-medium text-slate-400">
          Built with React Native & NativeWind
        </Text>
      </View>
    </View>
  );
}
