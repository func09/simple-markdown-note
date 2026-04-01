import { Link, useRouter } from "expo-router";
import { Lock, LogIn, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    // API連携は未実装のため、ダミーのログイン処理
    console.log("Login with:", email, password);
    // 成功したらメイン画面へ（現状は直接 /notes へ遷移をシミュレート）
    router.replace("/(main)/notes");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-8 justify-center">
          <View className="items-center mb-10">
            <View className="w-16 h-16 bg-slate-100 items-center justify-center rounded-2xl mb-4">
              <LogIn size={32} color="#0f172a" />
            </View>
            <Text className="text-3xl font-bold text-slate-900">
              おかえりなさい
            </Text>
            <Text className="text-slate-500 mt-2">
              アカウントにログインしてください
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">
                メールアドレス
              </Text>
              <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-12">
                <Mail size={18} color="#94a3b8" />
                <TextInput
                  placeholder="mail@example.com"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-3 text-slate-900"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">
                パスワード
              </Text>
              <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-12">
                <Lock size={18} color="#94a3b8" />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-3 text-slate-900"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              className="bg-slate-900 h-12 rounded-xl items-center justify-center mt-4 shadow-lg shadow-slate-300"
            >
              <Text className="text-white font-bold text-lg">ログイン</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-8 flex-row justify-center">
            <Text className="text-slate-500">
              アカウントをお持ちでないですか？{" "}
            </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text className="text-slate-900 font-semibold underline">
                  新規登録
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
