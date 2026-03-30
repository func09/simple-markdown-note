import type React from "react";
import {
  Navigate,
  Outlet,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { PATHS } from "@/features/notes/utils/path";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";

/**
 * 認証状態をチェックし、未認証ならログイン画面へリダイレクトするコンポーネント
 * Route element として使用する場合、子ルートを Outlet でレンダリングします。
 */
const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children || <Outlet />;
};

function App() {
  console.log("App: Rendering...");
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* 認証が必要なルートのグループ */}
        <Route element={<ProtectedRoute />}>
          {/* ノート表示系： /notes/all/:noteId?, /notes/trash/:noteId? など */}
          <Route path="/notes/:filter/:noteId?" element={<Dashboard />} />

          {/* タグ表示系： /tags/:tagName/:noteId? など */}
          <Route path="/tags/:tagName/:noteId?" element={<Dashboard />} />

          {/* デフォルト（/notes）は /notes/all にリダイレクト */}
          <Route path="/notes" element={<Navigate to={PATHS.ALL} replace />} />
          <Route path="/" element={<Navigate to={PATHS.ALL} replace />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={PATHS.ALL} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
