import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Info,
  Keyboard as KeyboardIcon,
  SquarePen,
  Tag,
  Trash2,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNoteStore } from "../";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { notes, addNote, updateNote, toggleTrash } = useNoteStore();

  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);
  const infoSheetRef = useRef<BottomSheetModal>(null);

  const note = useMemo(() => notes.find((n) => n.id === id), [id, notes]);

  const initialized = useRef<string | null>(null);

  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const charCount = useMemo(() => content.length, [content]);

  // Handle Initial Load only
  useEffect(() => {
    if (initialized.current !== id) {
      if (note) {
        setContent(note.content);
        setTags(note.tags);
      } else if (id === "new") {
        setContent("");
        setTags([]);
      }
      initialized.current = id ?? null;
    }
  }, [id, note]); // note is fine here for initial load as we check initialized.current

  // Debounced Auto-save to avoid infinite loop and excessive updates
  useEffect(() => {
    if (initialized.current !== id) return; // Wait for initial load

    const timer = setTimeout(() => {
      if (id === "new") {
        if (content.trim()) {
          const title = content.split("\n")[0].substring(0, 30) || "Untitled";
          addNote({
            title,
            content,
            tags,
            isTrash: false,
          });
        }
      } else {
        // Use getState to get current store values without causing re-renders
        const currentNote = useNoteStore
          .getState()
          .notes.find((n) => n.id === id);
        if (
          currentNote &&
          (content !== currentNote.content ||
            JSON.stringify(tags) !== JSON.stringify(currentNote.tags))
        ) {
          const title = content.split("\n")[0].substring(0, 30) || "Untitled";
          updateNote(currentNote.id, { content, title, tags });
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [content, tags, id, addNote, updateNote]); // Now linter is happy (no 'note' dependency needed)

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleKeyboardToggle = () => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
    } else {
      if (isPreview) setIsPreview(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleGoBack = () => {
    // If it's a new empty note, don't save or handle accordingly
    // Our existing useEffect handles saving
    router.back();
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.2}
      />
    ),
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Custom Header */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-slate-100 bg-white z-10">
        <TouchableOpacity
          onPress={handleGoBack}
          className="flex-row items-center p-2 -ml-2"
        >
          <ChevronLeft size={24} color="#0f172a" />
          <Text className="text-slate-900 font-medium ml-1">Back</Text>
        </TouchableOpacity>

        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={() => setIsPreview(!isPreview)}
            className="p-2"
            activeOpacity={0.7}
          >
            {isPreview ? (
              <EyeOff size={22} color="#475569" />
            ) : (
              <Eye size={22} color="#475569" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              infoSheetRef.current?.present();
            }}
            className="p-2 ml-1"
          >
            <Info size={22} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleKeyboardToggle}
            className="p-2 -mr-1"
          >
            {isKeyboardVisible ? (
              <KeyboardIcon size={22} color="#3b82f6" />
            ) : (
              <SquarePen size={22} color="#475569" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 bg-white"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {isPreview ? (
            <View className="flex-1 p-6">
              <Text className="text-lg text-slate-800 leading-relaxed">
                {content || (
                  <Text className="text-slate-300 italic">No content</Text>
                )}
              </Text>
            </View>
          ) : (
            <TextInput
              ref={inputRef}
              multiline
              placeholder="Enter content here..."
              placeholderTextColor="#cbd5e1"
              className="flex-1 p-6 text-lg text-slate-800 leading-relaxed text-left align-top"
              style={{ textAlignVertical: "top" }}
              value={content}
              onChangeText={setContent}
              autoFocus={id === "new"}
            />
          )}
        </ScrollView>

        {/* Tags Section */}
        <View className="px-4 py-3 border-t border-slate-100 bg-white flex-row items-center">
          <Tag size={16} color="#94a3b8" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="ml-2"
          >
            <View className="flex-row items-center space-x-2">
              {tags.map((tag) => (
                <View
                  key={tag}
                  className="bg-slate-100 px-3 py-1.5 rounded-full flex-row items-center"
                >
                  <Text className="text-xs font-medium text-slate-600">
                    {tag}
                  </Text>
                  <TouchableOpacity
                    className="ml-1.5 p-0.5"
                    onPress={() => setTags(tags.filter((t) => t !== tag))}
                  >
                    <X size={10} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity className="px-3 py-1.5 border border-dashed border-slate-300 rounded-full">
                <Text className="text-xs font-medium text-slate-400">
                  + Add Tag
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Info Bottom Sheet */}
      <BottomSheetModal
        ref={infoSheetRef}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView>
          {/* Info Rows */}
          <View className="border-t border-slate-100">
            {note && (
              <>
                <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
                  <Text className="text-base text-slate-800">Updated at</Text>
                  <Text className="text-base text-slate-400">
                    {formatDate(note.updatedAt)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
                  <Text className="text-base text-slate-800">Note ID</Text>
                  <Text
                    className="text-base text-slate-400 truncate ml-4"
                    numberOfLines={1}
                  >
                    {note.id}
                  </Text>
                </View>
              </>
            )}
            <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
              <Text className="text-base text-slate-800">Words</Text>
              <Text className="text-base text-slate-400">{wordCount}</Text>
            </View>
            <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
              <Text className="text-base text-slate-800">Characters</Text>
              <Text className="text-base text-slate-400">{charCount}</Text>
            </View>
          </View>

          {/* Actions */}
          <TouchableOpacity
            className="flex-row items-center px-5 py-4 mb-6"
            onPress={() => {
              if (note) {
                toggleTrash(note.id);
                infoSheetRef.current?.dismiss();
                setTimeout(() => router.back(), 250);
              }
            }}
          >
            <Trash2 size={20} color="#ef4444" />
            <Text className="text-base text-red-500 ml-3">
              {note?.isTrash ? "Restore from Trash" : "Move to Trash"}
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
