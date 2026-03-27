import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { TooltipProvider } from '@/components/ui/tooltip';

import Dashboard from '@/pages/Dashboard';
import LoginPage from '@/pages/Login';
import SignupPage from '@/pages/Signup';



// QueryClient の初期化
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // ウィンドウフォーカス時の再取得を無効化（好みによる）
      retry: 1, // 失敗時のリトライ回数
    },
  },
});

// 認証済みかどうかをチェックする簡単なガード
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster position="bottom-right" theme="dark" closeButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
