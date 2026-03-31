import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "../../../../components/common/Button";
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
} from "../../../../components/common/Display";
import { Input, Label } from "../../../../components/common/Form";
import type { AuthFormProps } from "../../../../features/auth/types";

/**
 * デスクトップ版専用の認証フォーム
 */
export const DesktopAuthForm: React.FC<AuthFormProps> = ({
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <Card className="overflow-hidden rounded-3xl border-white/10 bg-[#1e293b]/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />

        <CardHeader className="pb-4 pt-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-500 ring-1 ring-blue-500/20">
              <ShieldCheck size={28} />
            </div>
          </div>
          <CardTitle className="font-outfit text-3xl font-bold tracking-tight text-white">
            {type === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="mt-2 text-base text-slate-400">
            {type === "login"
              ? "Enter your details to sign in"
              : "Start your note-taking journey"}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert
                variant="destructive"
                className="rounded-xl border-red-500/40 bg-red-500/5 text-red-400"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="desktop-email"
                className="ml-1 text-sm font-medium text-slate-200"
              >
                Email
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-500" />
                <Input
                  id="desktop-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-12 rounded-xl border-white/5 bg-white/5 pl-10 text-white placeholder:text-slate-600 focus-visible:ring-2 focus-visible:ring-blue-500/40 transition-shadow"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="desktop-password"
                className="ml-1 text-sm font-medium text-slate-200"
              >
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-500" />
                <Input
                  id="desktop-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-white/5 bg-white/5 pl-10 text-white placeholder:text-slate-600 focus-visible:ring-2 focus-visible:ring-blue-500/40 transition-shadow"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-4 h-12 w-full gap-2 rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/30 active:scale-[0.98]"
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

        <CardFooter className="justify-center border-t border-white/5 py-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Powered by Hono JWT & D1
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

DesktopAuthForm.displayName = "DesktopAuthForm";
