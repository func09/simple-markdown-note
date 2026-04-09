import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  useDeleteUser,
  useLogout,
} from "@simple-markdown-note/api-client/hooks";
import { LogOut, User } from "lucide-react-native";
import type { RefObject } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../../auth/store";

interface SettingsSheetProps {
  sheetRef: RefObject<BottomSheetModal | null>;
}
/**
 * アプリ設定画面を提供するボトムシートコンポーネント。
 * アカウント情報の表示や、ログアウトのアクションを提供します。
 */
export function SettingsSheet({ sheetRef }: SettingsSheetProps) {
  "use memo";
  const { user, clearAuth } = useAuthStore();
  const logoutMutation = useLogout({
    onSuccess: () => {
      sheetRef.current?.dismiss();
      clearAuth();
    },
  });
  const deleteUserMutation = useDeleteUser({
    onSuccess: () => {
      sheetRef.current?.dismiss();
      clearAuth();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleDeleteUser = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteUserMutation.mutate(),
        },
      ]
    );
  };

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.4}
    />
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView>
        <View className="px-5 py-4 border-b border-slate-100">
          <Text className="text-xl font-bold text-slate-900">Settings</Text>
        </View>

        <View className="mt-2 mb-8">
          <View className="px-5 py-2">
            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Account
            </Text>
          </View>

          <View className="flex-row items-center px-5 py-4 border-b border-slate-50">
            <View className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <User size={20} color="#64748b" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xs text-slate-500 mb-0.5 font-medium">
                User name
              </Text>
              <Text className="text-base text-slate-900 font-semibold">
                {user?.email ?? "Not logged in"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="flex-row items-center px-5 py-4 mt-2"
            onPress={handleLogout}
            disabled={logoutMutation.isPending || deleteUserMutation.isPending}
          >
            <View className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
              <LogOut
                size={20}
                color={logoutMutation.isPending ? "#9ca3af" : "#64748b"}
              />
            </View>
            <Text
              className={`text-base font-semibold ml-4 ${logoutMutation.isPending ? "text-slate-400" : "text-slate-700"}`}
            >
              {logoutMutation.isPending ? "Logging out..." : "Log Out"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-5 py-4 mt-2"
            onPress={handleDeleteUser}
            disabled={logoutMutation.isPending || deleteUserMutation.isPending}
          >
            <View className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <LogOut
                size={20}
                color={deleteUserMutation.isPending ? "#fca5a5" : "#ef4444"}
              />
            </View>
            <Text
              className={`text-base font-semibold ml-4 ${deleteUserMutation.isPending ? "text-red-300" : "text-red-500"}`}
            >
              {deleteUserMutation.isPending
                ? "Deleting account..."
                : "Delete Account"}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
