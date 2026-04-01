import { type Href, useRouter } from "expo-router";
import { Menu, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

export function DevNavigation() {
  const [isDevMenuVisible, setIsDevMenuVisible] = useState(false);
  const router = useRouter();

  if (!__DEV__) return null;

  const devLinks = [
    { name: "Login", path: "/login" },
    { name: "Signup", path: "/signup" },
    { name: "Notes List", path: "/notes" },
    { name: "Note Detail (ID: 1)", path: "/notes/1" },
  ];

  const navigateTo = (path: string) => {
    setIsDevMenuVisible(false);
    // Use setTimeout to ensure the modal closes before navigation
    setTimeout(() => {
      router.push(path as Href);
    }, 100);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsDevMenuVisible(true)}
        className="absolute bottom-10 right-6 h-12 w-12 items-center justify-center rounded-full bg-slate-800 shadow-lg"
        activeOpacity={0.7}
      >
        <Menu size={20} color="white" />
      </TouchableOpacity>

      <Modal
        visible={isDevMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDevMenuVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsDevMenuVisible(false)}
          className="flex-1 items-center justify-center bg-black/50 px-6"
        >
          <View className="w-full rounded-3xl bg-white p-6 shadow-xl">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-slate-900">
                Dev Navigation
              </Text>
              <TouchableOpacity onPress={() => setIsDevMenuVisible(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="gap-y-3">
              {devLinks.map((link) => (
                <TouchableOpacity
                  key={link.path}
                  onPress={() => navigateTo(link.path)}
                  className="flex-row items-center rounded-2xl bg-slate-50 p-4 active:bg-slate-100"
                >
                  <Text className="text-lg font-semibold text-slate-700">
                    {link.name}
                  </Text>
                  <Text className="ml-auto text-slate-400">{link.path}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
