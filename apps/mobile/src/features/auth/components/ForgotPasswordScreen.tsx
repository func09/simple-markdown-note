import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "@simple-markdown-note/api-client/hooks";
import type { ForgotPasswordRequest } from "@simple-markdown-note/common/schemas";
import { ForgotPasswordRequestSchema } from "@simple-markdown-note/common/schemas";
import { Link, useRouter } from "expo-router";
import { AlertCircle, ArrowLeft, Mail, ShieldCheck } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
/**
 * パスワード再設定用のリセットリンクをリクエストするための画面コンポーネント。
 * ユーザーのメールアドレスを入力し、APIと通信してリクエストを送信します。
 */
export function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    mutate: forgotPasswordMutate,
    isPending: isLoading,
    error: apiError,
  } = useForgotPassword({
    onSuccess: () => {
      Alert.alert(
        "Reset Link Sent",
        "Check your email for a password reset link.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(ForgotPasswordRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordRequest) => {
    forgotPasswordMutate(data);
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
              <ShieldCheck size={32} color="#0f172a" />
            </View>
            <Text className="text-3xl font-bold text-slate-900">
              Forgot Password
            </Text>
            <Text className="text-slate-500 mt-2 text-center">
              Enter your email to receive a reset link
            </Text>
          </View>

          <View className="gap-y-4">
            {apiError && (
              <View className="bg-red-50 p-4 rounded-xl border border-red-100 flex-row items-center mb-2">
                <AlertCircle size={18} color="#ef4444" />
                <Text className="text-red-600 ml-2 flex-1 text-sm">
                  {apiError instanceof Error
                    ? apiError.message
                    : "Failed to send reset link"}
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
                <Text className="text-white font-bold text-lg">
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="mt-8 flex-row justify-center items-center">
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity
                disabled={isLoading}
                className="flex-row items-center"
              >
                <ArrowLeft size={16} color="#0f172a" />
                <Text className="text-slate-900 font-semibold ml-1">
                  Back to Login
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
