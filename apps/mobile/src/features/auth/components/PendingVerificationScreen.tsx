import {
  useMe,
  useResendVerification,
} from "@simple-markdown-note/api-client/hooks";
import { useRouter } from "expo-router";
import { ArrowRight, Mail } from "lucide-react-native";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../store";
/**
 * 新規登録後のメール承認待機中の状態を表示する画面コンポーネント。
 * 確認メールの再送や、承認が完了したかの確認アクションを提供します。
 */
export function PendingVerificationScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const insets = useSafeAreaInsets();

  const { mutate: resend, isPending } = useResendVerification();
  const { refetch: fetchMe, isFetching: isChecking } = useMe({
    enabled: false,
  });

  const handleResend = () => {
    if (!user?.email) return;
    resend(
      { email: user.email },
      {
        onSuccess: () => {
          Alert.alert("Success", "Verification email has been resent!");
        },
        onError: () => {
          Alert.alert("Error", "Failed to resend verification email.");
        },
      }
    );
  };

  const handleContinue = async () => {
    const { data: latestUser } = await fetchMe();
    if (latestUser && latestUser.status === "active") {
      if (token) {
        setAuth(latestUser, token);
        router.replace("/(main)/notes");
      }
    } else {
      Alert.alert(
        "Verification Pending",
        "Your email is still not verified. Please check your inbox and click the verification link."
      );
    }
  };

  return (
    <View
      className="flex-1 bg-white items-center justify-center p-8"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="w-full max-w-sm">
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-slate-100 items-center justify-center rounded-2xl mb-6">
            <Mail size={32} color="#0f172a" />
          </View>
          <Text className="text-3xl font-bold text-slate-900 text-center mb-2">
            Check your email
          </Text>
          <Text className="text-slate-500 text-center">
            We've sent a verification email to your address.
          </Text>
        </View>

        <Text className="text-slate-600 text-center mb-8">
          Please check your inbox and click the verification link to activate
          your account. If you don't see it, check your spam folder.
        </Text>

        <TouchableOpacity
          onPress={handleResend}
          disabled={isPending || !user?.email}
          className={`h-12 rounded-xl flex-row items-center justify-center mb-6 border ${
            isPending
              ? "bg-slate-50 border-slate-200"
              : "bg-white border-slate-300"
          }`}
        >
          {isPending ? (
            <ActivityIndicator color="#64748b" />
          ) : (
            <>
              <Mail size={18} color="#475569" />
              <Text className="text-slate-700 font-semibold ml-2">
                Resend Verification Email
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View className="border-t border-slate-100 pt-6">
          <TouchableOpacity
            onPress={handleContinue}
            disabled={isChecking}
            className="items-center"
          >
            {isChecking ? (
              <ActivityIndicator color="#64748b" />
            ) : (
              <View className="flex-row items-center">
                <Text className="text-slate-900 font-semibold mr-1">
                  I've verified my email
                </Text>
                <ArrowRight size={16} color="#0f172a" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
