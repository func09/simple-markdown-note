import { Stack } from "expo-router";

/**
 * ノート関連画面のレイアウトコンポーネント
 * @returns {JSX.Element} レイアウトコンポーネント
 */
export default function NotesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
