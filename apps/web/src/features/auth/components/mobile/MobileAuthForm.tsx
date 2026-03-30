import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/common/Button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/common/Display";
import { Input, Label } from "@/components/common/Form";
import type { AuthFormProps } from "@/features/auth/types";

/**
 * モバイル版専用の認証フォーム
 */
export const MobileAuthForm: React.FC<AuthFormProps> = ({
  type,
  onSubmit,
  isLoading,
  error,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="pb-6 pt-0 text-center">
          <CardTitle className="font-outfit text-2xl font-bold text-white">
            {type === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-slate-400">
            {type === "login"
              ? "Enter your details to sign in"
              : "Start your note-taking journey"}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert
                variant="destructive"
                className="rounded-xl border-red-500/50 bg-red-500/10 text-red-400"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="mobile-email"
                className="ml-1 text-xs text-slate-400 uppercase tracking-wider font-semibold"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="mobile-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-12 rounded-xl border-white/5 bg-white/5 pl-10 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="mobile-password"
                className="ml-1 text-xs text-slate-400 uppercase tracking-wider font-semibold"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="mobile-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-white/5 bg-white/5 pl-10 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-6 h-12 w-full gap-2 rounded-xl bg-blue-600 font-bold text-white transition-all active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {type === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center pt-6 pb-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">
            Secure Authentication
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

MobileAuthForm.displayName = "MobileAuthForm";
