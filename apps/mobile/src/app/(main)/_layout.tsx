import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Tabs } from "expo-router";
import { NotebookPen } from "lucide-react-native";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route);
        return {
          headerShown: false,
          tabBarStyle: {
            display: routeName === "[id]" ? "none" : "flex",
          },
        };
      }}
    >
      <Tabs.Screen
        name="notes"
        options={{
          title: "ノート",
          tabBarIcon: ({ color, size }) => (
            <NotebookPen color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
