import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNotes, useTags } from "@simple-markdown-note/api-client/hooks";
import type { Note } from "@simple-markdown-note/common/schemas";
import {
  NOTE_SCOPE,
  type NoteScope,
} from "@simple-markdown-note/common/schemas";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Menu, NotebookPen, Search } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDrawerState } from "../hooks";
import { filterNotes } from "../utils";
import { NoteDrawer } from "./NoteDrawer";
import { NoteListItem } from "./NoteListItem";
import { SettingsSheet } from "./SettingsSheet";

/**
 * ノート一覧画面のメインコンポーネント。
 *
 * 左からのドロワーメニュー、ノート一覧表示、検索ボックス、および新規作成・閲覧へのナビゲーションを提供します。
 */
export function NotesIndexScreen() {
  // 1. URLパラメータから現在のスコープ（一覧、ゴミ箱等）と選択中のタグを取得
  const { scope = NOTE_SCOPE.ALL, tag } = useLocalSearchParams<{
    scope?: string;
    tag?: string;
  }>();

  // 2. テキスト検索ボックスの入力を保持するローカルステート
  const [searchQuery, setSearchQuery] = useState("");

  // 設定用ボトムシートの参照
  const settingsSheetRef = useRef<BottomSheetModal>(null);

  // 3. APIからノート一覧を取得（現在のスコープとタグでバックエンドフィルタリング）
  const {
    data: notes = [],
    isLoading: isNotesLoading,
    refetch: refetchNotes,
  } = useNotes({ scope: scope as NoteScope, tag });

  // 4. APIからすべての付与済みタグ一覧を取得（ドロワーのタグ一覧表示用）
  const { data: apiTags = [] } = useTags();
  const tags = apiTags.map((t) => t.name);

  // 5. 検索クエリに基づき、クライアントサイドでノートを全文検索してフィルタリング
  const filteredNotes = useMemo(
    () => filterNotes(notes as unknown as Note[], searchQuery),
    [notes, searchQuery]
  );

  // 6. ドロワーメニューのアニメーションと開閉状態を管理するカスタムフック
  const { isDrawerOpen, slideAnim, toggleDrawer } = useDrawerState();

  // UIスタイリングのためのセーフエリア幅とナビゲーション用ルーター

  const insets = useSafeAreaInsets();
  const router = useRouter();

  /**
   * 現在の表示リストに応じたヘッダーのタイトルを返します。
   */
  const getHeaderTitle = () => {
    if (tag) return tag;
    if (scope === NOTE_SCOPE.TRASH) return "Trash";
    if (scope === NOTE_SCOPE.UNTAGGED) return "Untagged";
    return "All Notes";
  };

  /**
   * スコープ（すべてのノート/ゴミ箱など）を選択したときのハンドラ。
   */
  const handleSelectScope = useCallback(
    (newScope: string) => {
      toggleDrawer(false);
      router.setParams({ scope: newScope, tag: undefined });
    },
    [toggleDrawer, router]
  );

  /**
   * タグを選択したときのハンドラ。
   */
  const handleSelectTag = useCallback(
    (newTag: string) => {
      toggleDrawer(false);
      router.setParams({ tag: newTag, scope: undefined });
    },
    [toggleDrawer, router]
  );

  /**
   * 新規ノート作成画面への遷移。
   */
  const handleNewNote = useCallback(
    () => router.push("/(main)/notes/new"),
    [router]
  );

  /**
   * 指定したノートの編集/プレビュー画面への遷移。
   */
  const handleSelectNote = useCallback(
    (id: string) => router.push(`/(main)/notes/${id}`),
    [router]
  );

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <NoteDrawer
        isOpen={isDrawerOpen}
        onClose={() => toggleDrawer(false)}
        slideAnim={slideAnim}
        scope={scope}
        tag={tag}
        onSelectScope={handleSelectScope}
        onSelectTag={handleSelectTag}
        tags={tags}
        onOpenSettings={() => settingsSheetRef.current?.present()}
      />

      <View className="px-5 py-4 border-b border-slate-100 bg-white">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => toggleDrawer(true)}
              className="p-2 -ml-2 mr-1"
            >
              <Menu size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-slate-900">
              {getHeaderTitle()}
            </Text>
          </View>
          <TouchableOpacity onPress={handleNewNote} className="p-2 -mr-2">
            <NotebookPen size={22} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-11">
          <Search size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search notes..."
            placeholderTextColor="#94a3b8"
            className="flex-1 ml-2 text-slate-900 text-sm"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredNotes}
        renderItem={({ item }) => (
          <NoteListItem item={item} onPress={handleSelectNote} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isNotesLoading}
            onRefresh={refetchNotes}
          />
        }
        ListEmptyComponent={
          !isNotesLoading ? (
            <View className="flex-1 items-center justify-center p-10 mt-20">
              <View className="w-16 h-16 bg-slate-50 items-center justify-center rounded-full mb-4">
                <Search size={24} color="#cbd5e1" />
              </View>
              <Text className="text-slate-400 font-medium">No notes found</Text>
            </View>
          ) : null
        }
      />

      <SettingsSheet sheetRef={settingsSheetRef} />
    </View>
  );
}
