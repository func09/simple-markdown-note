import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
/**
 * 複数のTailwind CSSクラスを安全に結合し、競合するスタイルを解決するユーティリティ関数です。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
