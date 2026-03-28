import { useMemo, useCallback } from 'react';
import type { Note, Tag } from 'openapi';
import { create, insertMultiple, search } from '@orama/orama';
import { createTokenizer } from '@orama/tokenizers/japanese';
import { stopwords as japaneseStopwords } from '@orama/stopwords/japanese';

export const useOramaSearch = (notes: Note[], selectedTag: string | null, searchQuery: string) => {
  // Oramaインメモリデータベースの同期構築
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
          const searchResult = search(dbInstance, { term: query, properties: ['content'] });
          const matchedSet = new Set((searchResult as any).hits.map((hit: any) => hit.document.id));
          result = result.filter((note) => matchedSet.has(note.id));
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
