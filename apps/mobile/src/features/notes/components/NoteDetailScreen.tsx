import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  useCreateNote,
  useDeleteNote,
  useNote,
  usePermanentDelete,
  useRestoreNote,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
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
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 16 * 1.6,
    color: "#334155", // slate-700
  },
  heading1: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a", // slate-900
    marginVertical: 10,
  },
  heading2: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginVertical: 8,
  },
  heading3: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginVertical: 6,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 16 * 1.6,
    color: "#334155",
    marginBottom: 8,
  },
  list_item: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
  code_inline: {
    backgroundColor: "#f1f5f9", // slate-100
    color: "#475569", // slate-600
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  code_block: {
    backgroundColor: "#1e293b", // slate-800
    color: "#f8fafc", // slate-50
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  fence: {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: "#cbd5e1", // slate-300
    paddingLeft: 12,
    marginVertical: 8,
    fontStyle: "italic",
  },
  link: {
    color: "#3b82f6", // blue-500
    textDecorationLine: "underline",
  },
});

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);

  // API Hooks
  const { data: note, isLoading } = useNote(isNew ? null : id, {
    enabled: !isDeleting,
  });
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const restoreNoteMutation = useRestoreNote();
  const permanentDeleteMutation = usePermanentDelete();

  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);
  const infoSheetRef = useRef<BottomSheetModal>(null);

  const initializedId = useRef<string | null>(null);
  const currentNoteId = useRef<string | null>(isNew ? null : id);

  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const charCount = useMemo(() => content.length, [content]);

  // Handle Initial Load and external data updates
  useEffect(() => {
    if (isNew) {
      if (initializedId.current !== "new") {
        setContent("");
        setTags([]);
        initializedId.current = "new";
      }
    } else if (note && initializedId.current !== note.id) {
      setContent(note.content);
      setTags(note.tags.map((t) => t.name));
      initializedId.current = note.id;
      currentNoteId.current = note.id;
    }
  }, [isNew, note]);

  // Debounced Auto-save
  useEffect(() => {
    if (isLoading) return;
    if (!content.trim() && isNew) return;

    const timer = setTimeout(async () => {
      const activeId = currentNoteId.current;

      if (isNew && !activeId) {
        // Create new note
        try {
          const result = await createNoteMutation.mutateAsync({
            content,
            tags,
            isPermanent: false,
          });
          currentNoteId.current = result.id;
          // Update URL to the new ID without push to avoid back-button issues if possible
          // But router.setParams might work best here
          router.setParams({ id: result.id });
          initializedId.current = result.id;
        } catch (error) {
          console.error("Failed to create note:", error);
        }
      } else if (activeId) {
        // Update existing note
        // Only update if content or tags actually changed compared to the last fetched note
        if (
          note &&
          (content !== note.content ||
            JSON.stringify(tags) !==
              JSON.stringify(note.tags.map((t) => t.name)))
        ) {
          updateNoteMutation.mutate({
            id: activeId,
            data: { content, tags },
          });
        }
      }
    }, 1000); // 1s debounce for API calls

    return () => clearTimeout(timer);
  }, [
    content,
    tags,
    isNew,
    note,
    isLoading,
    createNoteMutation,
    updateNoteMutation,
    router,
  ]);

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
    router.back();
  };

  const handleTrashAction = async () => {
    if (!currentNoteId.current) return;

    setIsDeleting(true);
    try {
      if (note?.deletedAt) {
        await restoreNoteMutation.mutateAsync(currentNoteId.current);
      } else {
        await deleteNoteMutation.mutateAsync(currentNoteId.current);
      }
      infoSheetRef.current?.dismiss();
      setTimeout(() => router.back(), 250);
    } catch (error) {
      setIsDeleting(false);
      console.error("Failed to toggle trash:", error);
    }
  };

  const handlePermanentDelete = async () => {
    if (!currentNoteId.current) return;
    setIsDeleting(true);
    try {
      await permanentDeleteMutation.mutateAsync(currentNoteId.current);
      infoSheetRef.current?.dismiss();
      setTimeout(() => router.back(), 250);
    } catch (error) {
      setIsDeleting(false);
      console.error("Failed to permanently delete note:", error);
    }
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
              {content ? (
                <Markdown style={markdownStyles}>{content}</Markdown>
              ) : (
                <Text className="text-slate-300 italic">No content</Text>
              )}
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
              autoFocus={isNew}
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
              <TouchableOpacity
                className="px-3 py-1.5 border border-dashed border-slate-300 rounded-full"
                onPress={() => {
                  if (Platform.OS === "ios") {
                    Alert.prompt(
                      "Add Tag",
                      "Enter a name for the new tag",
                      (text) => {
                        if (text.trim() && !tags.includes(text.trim())) {
                          setTags([...tags, text.trim()]);
                        }
                      }
                    );
                  } else {
                    Alert.alert(
                      "Pending",
                      "Tag input for Android is currently pending."
                    );
                  }
                }}
              >
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
          <View className="mb-6">
            <TouchableOpacity
              className="flex-row items-center px-5 py-4 border-b border-slate-50"
              onPress={handleTrashAction}
            >
              <Trash2
                size={20}
                color={note?.deletedAt ? "#3b82f6" : "#ef4444"}
              />
              <Text
                className={`text-base ml-3 ${
                  note?.deletedAt ? "text-blue-500" : "text-red-500"
                }`}
              >
                {note?.deletedAt ? "Restore from Trash" : "Move to Trash"}
              </Text>
            </TouchableOpacity>

            {note?.deletedAt && (
              <TouchableOpacity
                className="flex-row items-center px-5 py-4"
                onPress={handlePermanentDelete}
              >
                <X size={20} color="#ef4444" />
                <Text className="text-base text-red-500 ml-3">
                  Permanently Delete
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
