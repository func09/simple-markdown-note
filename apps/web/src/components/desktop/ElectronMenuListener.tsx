import { useElectronMenu } from "@/hooks/desktop/useElectronMenu";
/**
 * デスクトップ版のElectronメニューからのイベントリスナーを設定するコンポーネント。
 * UIは持たず、バックグラウンドでのメニュー操作をリッスンします。
 */
export function ElectronMenuListener() {
  useElectronMenu();
  return null;
}
