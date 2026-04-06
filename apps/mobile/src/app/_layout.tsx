import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import "./global.css";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Providers } from "@/components/Providers";
import { useDevMenu } from "@/hooks/useDevMenu";

/**
 * アプリのルートレイアウトコンポーネント
 * プロバイダーやグローバルな設定を初期化する
 * @returns {JSX.Element} ルートレイアウトコンポーネント
 */
export default function RootLayout() {
  useDevMenu();
  return (
    <SafeAreaProvider>
      <Providers>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <Stack>
              <Stack.Screen name="index" options={{ title: "Home" }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(main)" options={{ headerShown: false }} />
            </Stack>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </Providers>
    </SafeAreaProvider>
  );
}
