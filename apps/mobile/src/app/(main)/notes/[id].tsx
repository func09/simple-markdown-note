import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-slate-50">
      <View>
        <Text className="text-2xl font-bold text-center">
          Note Detail Screen
        </Text>
        <Text className="text-lg text-slate-500 text-center mt-2">
          ID: {id}
        </Text>
      </View>
    </SafeAreaView>
  );
}
