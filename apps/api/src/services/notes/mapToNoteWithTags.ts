import type { Tag } from "@simple-markdown-note/database";

/**
 * Repository から取得した Notes (with tags) をレスポンス形式にマッピングする
 */
export function mapToNoteWithTags<T extends { notesToTags: { tag: Tag }[] }>(
  note: T
) {
  const { notesToTags, ...rest } = note;
  return {
    ...rest,
    tags: notesToTags.map((nt) => nt.tag),
  };
}
