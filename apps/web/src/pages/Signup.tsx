import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signup } from "@/features/auth/api";
import { AuthForm } from "@/features/auth/components/AuthForm";

const SignupPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      await signup({ email: data.email, password: data.password });
      toast.success("Successfully signed up! Please login.");
      navigate("/login");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Signup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0f172a] p-4 selection:bg-blue-500/30">
      <AuthForm type="signup" onSubmit={handleSignup} isLoading={isLoading} />
      <div className="mt-8 text-slate-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;
