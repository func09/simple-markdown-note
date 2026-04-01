import { StatusBar } from "expo-status-bar";
import { ChevronRight, NotebookPen } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" />

      <View className="flex-1 items-center justify-center px-6">
        {/* Logo/Icon Section */}
        <View className="mb-8 items-center justify-center rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <NotebookPen size={64} color="#3b82f6" strokeWidth={1.5} />
        </View>

        {/* Text Section */}
        <View className="items-center">
          <Text className="mb-2 text-4xl font-bold tracking-tight text-slate-900">
            Simplenote Clone
          </Text>
          <Text className="text-center text-lg leading-6 text-slate-500">
            The simplest way to keep notes.{"\n"}
            Light, clean, and free.
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="mt-12 flex-row items-center justify-center rounded-2xl bg-blue-500 px-8 py-4 shadow-lg shadow-blue-200"
        >
          <Text className="mr-2 text-lg font-semibold text-white">
            Get Started
          </Text>
          <ChevronRight size={20} color="white" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Footer Info */}
      <View className="pb-8 items-center">
        <Text className="text-sm font-medium text-slate-400">
          Built with React Native & NativeWind
        </Text>
      </View>
    </SafeAreaView>
  );
}
