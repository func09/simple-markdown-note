import type React from "react";
import { Link } from "react-router-dom";

import { DesktopAuthForm } from "../features/auth/components/desktop/DesktopAuthForm";
import { MobileAuthForm } from "../features/auth/components/mobile/MobileAuthForm";
import { useAuthActions } from "../features/auth/hooks";
import { useMediaQuery } from "../hooks/useMediaQuery";

const LoginPage: React.FC = () => {
  const { isLoading, handleLogin } = useAuthActions();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const AuthForm = isMobile ? MobileAuthForm : DesktopAuthForm;

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0f172a] p-4 selection:bg-blue-500/30">
      <AuthForm type="login" onSubmit={handleLogin} isLoading={isLoading} />
      <div className="mt-8 text-slate-400">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
