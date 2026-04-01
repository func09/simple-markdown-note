import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotesIndexScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-slate-50">
      <View>
        <Text className="text-2xl font-bold">Notes List Screen</Text>
      </View>
    </SafeAreaView>
  );
}
