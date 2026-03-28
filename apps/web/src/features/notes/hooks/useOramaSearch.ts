import { useMemo, useCallback } from 'react';
import type { Note, Tag } from 'openapi';
import { create, insertMultiple, search } from '@orama/orama';
import { createTokenizer } from '@orama/tokenizers/japanese';
import { stopwords as japaneseStopwords } from '@orama/stopwords/japanese';

/**
 * クライアントサイドでの高速な全文検索を提供するカスタムフック
 * Orama をインメモリの検索エンジンとして用い、日本語（Fuzzy Search無効化・スペース区切りAND検索保証）によるノートの絞り込みを行います。
 *
 * @param notes 検索対象となるすべてのノート配列
 * @param selectedTag 現在選択されているタグ（または '__untagged__'）
 * @param searchQuery ユーザーが入力した検索キーワード
 * @returns { oramaDb, filteredNotes, searchNotes } 検索エンジンインスタンス、検索結果、およひ同期検索関数
 */
export const useOramaSearch = (notes: Note[], selectedTag: string | null, searchQuery: string) => {
  // Oramaインメモリデータベースの同期構築
  /**
   * Oramaベースのインメモリ検索エンジンインスタンス
   * ノート一覧（notes）が変更されるたびに、日本語トークナイザーを利用してインデックスを再構築します
   */
  const oramaDb = useMemo(() => {
    const dbInstance = create({
      schema: {
        id: 'string',
        content: 'string',
      },
      components: {
        tokenizer: createTokenizer({
          language: 'japanese',
          stopWords: japaneseStopwords,
        }),
      },
    });

    if (notes.length > 0) {
      insertMultiple(
        dbInstance,
        notes.map((n) => ({ id: n.id, content: n.content }))
      );
    }
    return dbInstance;
  }, [notes]);

  // 同期的にフィルタリングを行う関数
  /**
   * 対象のノート配列に対して、指定したタグとクエリ（Oramaインスタンス経由）で同期的に絞り込みを行う関数
   *
   * @param targetNotes 絞り込みの対象となるノート配列
   * @param tag 指定したいタグ名、もしくは未分類 '__untagged__'、該当なしの場合は null
   * @param query 検索ボックスに入力された文字列
   * @param dbInstance Oramaのインスタンス。未指定の場合はフォールバックとして部分一致検索（includes）を利用します
   * @returns フィルタリングおよび更新日時（降順）でソートされたノートの配列
   */
  const searchNotes = useCallback(
    (targetNotes: Note[], tag: string | null, query: string, dbInstance?: any) => {
      let result = [...targetNotes];

      if (tag === '__untagged__') {
        result = result.filter((note) => !note.tags || note.tags.length === 0);
      } else if (tag) {
        result = result.filter((note) => note.tags?.some((t: Tag) => t.name === tag));
      }

      if (query) {
        if (dbInstance) {
          const searchResult = search(dbInstance, {
            term: query,
            properties: ['content'],
            tolerance: 0, // 無関係な文字がヒットするタイポ許容(Fuzzy Search)を無効化
            limit: 100000, // クライアントサイドでの全ての候補を取得する
          });
          const matchedSet = new Set((searchResult as any).hits.map((hit: any) => hit.document.id));

          // OramaはデフォルトでOR検索的にヒットを集めるため（助詞の「です」などでヒットしてしまう）、
          // 最終的に入力された検索キーワード（スペース区切り）がすべて含まれるか（AND検索）を保証する
          const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
          result = result.filter((note) => {
            if (!matchedSet.has(note.id)) return false;
            const contentLower = note.content.toLowerCase();
            return queryTerms.every((q) => contentLower.includes(q));
          });
        } else {
          const q = query.toLowerCase();
          result = result.filter((note) => note.content.toLowerCase().includes(q));
        }
      }

      result.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      });

      return result;
    },
    []
  );

  /**
   * 現在のコンテキスト（ノート一覧、選択中のタグ、検索クエリ）に基づいて自動算出される、画面表示用のフィルタリング済みノート一覧
   */
  const filteredNotes = useMemo(
    () => searchNotes(notes, selectedTag, searchQuery, oramaDb),
    [notes, searchQuery, selectedTag, searchNotes, oramaDb]
  );

  return {
    oramaDb,
    filteredNotes,
    searchNotes,
  };
};
