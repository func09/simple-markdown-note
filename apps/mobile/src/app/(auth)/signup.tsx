import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <View>
        <Text className="text-2xl font-bold">Signup Screen</Text>
      </View>
    </SafeAreaView>
  );
}
