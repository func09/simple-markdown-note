import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@simple-markdown-note/api-client/hooks";
import type { SigninRequest } from "@simple-markdown-note/common/schemas";
import { SigninRequestSchema } from "@simple-markdown-note/common/schemas";
import { Link, useRouter } from "expo-router";
import { AlertCircle, Lock, LogIn, Mail } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../store";

/**
 * ログイン画面コンポーネント
 * ユーザーのメールアドレスとパスワードを受け取り、サインイン処理を行います。
 */
export function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const insets = useSafeAreaInsets();

  // ログイン処理のAPIミューテーション
  const {
    mutate: loginMutate,
    isPending: isLoading,
    error: apiError,
  } = useLogin({
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.replace("/(main)/notes");
    },
  });

  // フォームの状態管理（react-hook-form）とバリデーション設定
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninRequest>({
    resolver: zodResolver(SigninRequestSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // フォーム送信ハンドラ
  const onSubmit = (data: SigninRequest) => {
    loginMutate(data);
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
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

          <View className="gap-y-4">
            {apiError && (
              <View className="bg-red-50 p-4 rounded-xl border border-red-100 flex-row items-center mb-2">
                <AlertCircle size={18} color="#ef4444" />
                <Text className="text-red-600 ml-2 flex-1 text-sm">
                  {apiError instanceof Error
                    ? apiError.message
                    : "Login failed"}
                </Text>
              </View>
            )}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">
                    Email Address
                  </Text>
                  <View
                    className={`flex-row items-center bg-slate-100 rounded-xl px-4 h-12 border ${
                      errors.email ? "border-red-500" : "border-transparent"
                    }`}
                  >
                    <Mail size={18} color="#94a3b8" />
                    <TextInput
                      placeholder="mail@example.com"
                      placeholderTextColor="#94a3b8"
                      className="flex-1 ml-3 text-slate-900"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!isLoading}
                    />
                  </View>
                  {errors.email && (
                    <Text className="text-red-500 text-xs mt-1 ml-1">
                      {errors.email.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">
                    Password
                  </Text>
                  <View
                    className={`flex-row items-center bg-slate-100 rounded-xl px-4 h-12 border ${
                      errors.password ? "border-red-500" : "border-transparent"
                    }`}
                  >
                    <Lock size={18} color="#94a3b8" />
                    <TextInput
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                      className="flex-1 ml-3 text-slate-900"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry
                      editable={!isLoading}
                    />
                  </View>
                  {errors.password && (
                    <Text className="text-red-500 text-xs mt-1 ml-1">
                      {errors.password.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
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
    </View>
  );
}
