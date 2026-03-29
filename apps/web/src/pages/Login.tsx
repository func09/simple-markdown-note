import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signin } from "@/features/auth/api";
import { AuthForm } from "@/features/auth/components/AuthForm";

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await signin({ email: data.email, password: data.password });
      localStorage.setItem("token", res.token);
      toast.success("Logged in successfully");
      navigate("/");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
