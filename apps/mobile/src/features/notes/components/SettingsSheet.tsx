import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useLogout } from "@simple-markdown-note/api-client/hooks";
import { LogOut, User } from "lucide-react-native";
import { type RefObject, useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../../auth/store";

interface SettingsSheetProps {
  sheetRef: RefObject<BottomSheetModal | null>;
}

export function SettingsSheet({ sheetRef }: SettingsSheetProps) {
  const { user, clearAuth } = useAuthStore();
  const logoutMutation = useLogout({
    onSuccess: () => {
      sheetRef.current?.dismiss();
      clearAuth();
    },
  });

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
      />
    ),
    []
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
            disabled={logoutMutation.isPending}
          >
            <View className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <LogOut
                size={20}
                color={logoutMutation.isPending ? "#fca5a5" : "#ef4444"}
              />
            </View>
            <Text
              className={`text-base font-semibold ml-4 ${logoutMutation.isPending ? "text-red-300" : "text-red-500"}`}
            >
              {logoutMutation.isPending ? "Logging out..." : "Log Out"}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
