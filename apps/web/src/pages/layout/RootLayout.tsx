import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { ElectronMenuListener } from "@/components/desktop/ElectronMenuListener";
import { Providers } from "@/components/providers/Providers";
import "@/index.css";
/**
 * React Routerの最上位レイアウトコンポーネント。
 * Context Providerの展開、Toasterの配置、さらにデスクトップ版特有のElectronメニューのリスナーを設定します。
 */
export default function RootLayout() {
  return (
    <Providers>
      {window.electron && <ElectronMenuListener />}
      <div className="min-h-full flex flex-col flex-1">
        <Outlet />
      </div>
      <Toaster position="top-center" expand visibleToasts={3} />
    </Providers>
  );
}
