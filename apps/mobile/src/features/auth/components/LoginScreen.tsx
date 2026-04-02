import { useLogin } from "api-client/hooks";
import { Link, useRouter } from "expo-router";
import { AlertCircle, Lock, LogIn, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    mutate: loginMutate,
    isPending: isLoading,
    error,
  } = useLogin({
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.replace("/(main)/notes");
    },
  });

  const handleLogin = () => {
    if (!email || !password) return;
    loginMutate({ email, password });
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
              Welcome Back
            </Text>
            <Text className="text-slate-500 mt-2">
              Please log in to your account
            </Text>
          </View>

          <View className="space-y-4">
            {error && (
              <View className="bg-red-50 p-4 rounded-xl border border-red-100 flex-row items-center mb-4">
                <AlertCircle size={18} color="#ef4444" />
                <Text className="text-red-600 ml-2 flex-1 text-sm">
                  {error instanceof Error ? error.message : "Login failed"}
                </Text>
              </View>
            )}

            <View>
              <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">
                Email Address
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
                  editable={!isLoading}
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">
                Password
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
                  editable={!isLoading}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className={`h-12 rounded-xl items-center justify-center mt-4 shadow-lg ${
                isLoading ? "bg-slate-700" : "bg-slate-900 shadow-slate-300"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Log In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="mt-8 flex-row justify-center">
            <Text className="text-slate-500">Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity disabled={isLoading}>
                <Text className="text-slate-900 font-semibold underline">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
