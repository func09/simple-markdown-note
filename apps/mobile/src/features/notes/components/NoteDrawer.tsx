import {
  NotebookPen,
  Settings,
  Tag as TagIcon,
  Trash2,
} from "lucide-react-native";
import {
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DRAWER_WIDTH } from "../constants";

type NoteDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  slideAnim: Animated.Value;
  scope?: string;
  tag?: string;
  onSelectScope: (scope: string) => void;
  onSelectTag: (tag: string) => void;
  tags: string[];
  onOpenSettings?: () => void;
};

export function NoteDrawer({
  isOpen,
  onClose,
  slideAnim,
  scope,
  tag,
  onSelectScope,
  onSelectTag,
  tags,
  onOpenSettings,
}: NoteDrawerProps) {
  const insets = useSafeAreaInsets();

  if (!isOpen) return null;

  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          className="absolute inset-0 bg-black/40 z-40"
          style={{ height: Dimensions.get("window").height }}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        className="absolute left-0 top-0 bottom-0 bg-white z-50 shadow-2xl"
        style={{
          width: DRAWER_WIDTH,
          transform: [{ translateX: slideAnim }],
        }}
      >
        <View
          className="flex-1"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          <View className="flex-1 pt-6">
            <View className="px-2 mb-6">
              <TouchableOpacity
                onPress={() => onSelectScope("all")}
                className={`flex-row items-center px-4 py-3 rounded-xl ${
                  (!scope || scope === "all") && !tag ? "bg-blue-50" : ""
                }`}
              >
                <NotebookPen
                  size={20}
                  color={
                    (!scope || scope === "all") && !tag ? "#3b82f6" : "#475569"
                  }
                />
                <Text
                  className={`ml-4 text-sm font-semibold ${
                    (!scope || scope === "all") && !tag
                      ? "text-blue-600"
                      : "text-slate-600"
                  }`}
                >
                  All Notes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onSelectScope("trash")}
                className={`flex-row items-center px-4 py-3 rounded-xl mt-1 ${
                  scope === "trash" ? "bg-slate-100" : ""
                }`}
              >
                <Trash2
                  size={20}
                  color={scope === "trash" ? "#0f172a" : "#475569"}
                />
                <Text
                  className={`ml-4 text-sm font-semibold ${
                    scope === "trash" ? "text-slate-900" : "text-slate-600"
                  }`}
                >
                  Trash
                </Text>
              </TouchableOpacity>
            </View>

            <View className="px-6 mb-2">
              <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Tags
              </Text>
            </View>
            <View className="px-2">
              {tags.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => onSelectTag(t)}
                  className={`flex-row items-center px-4 py-2.5 rounded-xl ${
                    tag === t ? "bg-blue-50" : ""
                  }`}
                >
                  <TagIcon
                    size={16}
                    color={tag === t ? "#3b82f6" : "#94a3b8"}
                  />
                  <Text
                    className={`ml-4 text-sm font-medium ${
                      tag === t ? "text-blue-600" : "text-slate-600"
                    }`}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mt-auto px-2 pb-6 border-t border-slate-50 pt-4">
              <TouchableOpacity
                onPress={() => onSelectScope("untagged")}
                className={`flex-row items-center px-4 py-3 rounded-xl ${
                  scope === "untagged" ? "bg-blue-50" : ""
                }`}
              >
                <TagIcon
                  size={18}
                  color={scope === "untagged" ? "#3b82f6" : "#64748b"}
                  className="rotate-90"
                />
                <Text
                  className={`ml-4 text-sm font-medium ${
                    scope === "untagged" ? "text-blue-600" : "text-slate-500"
                  }`}
                >
                  Untagged Notes...
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onOpenSettings?.();
                }}
                className="flex-row items-center px-4 py-3 rounded-xl mt-1"
              >
                <Settings size={18} color="#475569" />
                <Text className="ml-4 text-sm font-medium text-slate-600">
                  Settings
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
}
