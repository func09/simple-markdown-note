"use client";

import { AlertCircle, ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
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

interface SignupFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
  isLoading: boolean;
  error?: string;
}

/**
 * モバイル版新規登録フォーム
 */
export default function SignupForm({
  onSubmit,
  isLoading,
  error,
}: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <div className="w-full px-4">
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="pb-6 pt-0 text-center">
          <CardTitle className="text-2xl font-bold text-slate-900">
            Create Account
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-slate-500">
            Start your note-taking journey
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert
                variant="destructive"
                className="rounded-xl border-red-200 bg-red-50 text-red-600"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="mobile-signup-email"
                className="ml-1 text-xs text-slate-500 uppercase tracking-widest font-bold"
              >
                Email
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900" />
                <Input
                  id="mobile-signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-12 rounded-xl border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-400"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="mobile-signup-password"
                className="ml-1 text-xs text-slate-500 uppercase tracking-widest font-bold"
              >
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900" />
                <Input
                  id="mobile-signup-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-400"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-6 h-12 w-full gap-2 rounded-xl bg-slate-900 font-bold text-white shadow-lg shadow-slate-900/10 active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-slate-900 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </CardContent>

        <CardFooter className="justify-center border-t border-slate-100 pt-6 mt-4 pb-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            Secure Authentication
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
