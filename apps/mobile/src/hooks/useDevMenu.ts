import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Href, useRouter } from "expo-router";
import { useEffect } from "react";
/**
 * 開発環境専用のデバッグ用メニューをExpo Dev Menuに登録するためのカスタムフック。
 * 任意の画面への直接遷移やAsyncStorageのデバッグ確認機能を提供します。
 */
export function useDevMenu() {
  const router = useRouter();

  useEffect(() => {
    // Only run in development
    if (!__DEV__) return;

    // We use require here to avoid importing expo-dev-menu in production if possible,
    // though the __DEV__ check above should be enough.
    const DevMenu = require("expo-dev-menu");

    const debugStorage = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        // @ts-expect-error - AsyncStorage types might be out of sync
        const items = await AsyncStorage.multiGet(keys);
        console.log("--- AsyncStorage Debug ---");
        items.forEach(([key, value]: [string, string | null]) => {
          try {
            console.log(`${key}:`, value ? JSON.parse(value) : null);
          } catch {
            console.log(`${key}:`, value);
          }
        });
        console.log("--------------------------");
      } catch (error) {
        console.error("Storage Debug Error:", error);
      }
    };

    DevMenu.registerDevMenuItems([
      {
        name: "Navigate: Login",
        callback: () => router.push("/login" as Href),
      },
      {
        name: "Navigate: Signup",
        callback: () => router.push("/signup" as Href),
      },
      {
        name: "Navigate: Notes List",
        callback: () => router.push("/notes" as Href),
      },
      {
        name: "Navigate: Note Detail (1)",
        callback: () => router.push("/notes/1" as Href),
      },
      {
        name: "Debug: Storage Data",
        callback: debugStorage,
      },
    ]);
  }, [router]);
}
