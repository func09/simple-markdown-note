import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  type: "login" | "signup";
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

/**
 * ログイン・サインアップ共通のフォームコンポーネント (shadcn/ui 使用版)
 */
export const AuthForm: React.FC<AuthFormProps> = ({
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
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <Card className="overflow-hidden rounded-3xl border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-xl">
        <CardHeader className="pb-4 pt-8 text-center">
          <CardTitle className="font-outfit text-3xl font-bold tracking-tight text-white">
            {type === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="mt-2 text-base text-slate-400">
            {type === "login"
              ? "Enter your details to sign in"
              : "Start your note-taking journey"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="space-y-2">
              <Label htmlFor="email" className="ml-1 text-slate-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-12 rounded-xl border-slate-800 bg-slate-950/50 pl-10 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="ml-1 text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-slate-800 bg-slate-950/50 pl-10 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-4 h-12 w-full gap-2 rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500"
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

        <CardFooter className="justify-center pb-8">
          <p className="text-sm text-slate-500">
            Secure authentication powered by Hono JWT
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
