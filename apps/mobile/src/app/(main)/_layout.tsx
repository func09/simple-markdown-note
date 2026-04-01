import { Tabs } from "expo-router";
import { NotebookPen } from "lucide-react-native";

export default function MainLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
          tabBarIcon: ({ color, size }) => (
            <NotebookPen color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
