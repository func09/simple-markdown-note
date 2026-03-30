/**
 * ノート一覧のパス定義
 */
export const PATHS = {
  ALL: "/notes/all",
  TRASH: "/notes/trash",
  UNTAGGED: "/notes/untagged",
  TAGS: "/tags",
} as const;

/**
 * ゴミ箱フラグやタグ名に基づいて、遷移先のノート一覧パスを生成します。
 */
export const getNotePath = (
  isTrash: boolean,
  tag?: string | null,
  noteId?: string | null
): string => {
  let basePath: string = PATHS.ALL;
  if (isTrash) {
    basePath = PATHS.TRASH;
  } else if (tag === "__untagged__") {
    basePath = PATHS.UNTAGGED;
  } else if (tag) {
    basePath = `${PATHS.TAGS}/${tag}`;
  }

  return noteId ? `${basePath}/${noteId}` : basePath;
};
