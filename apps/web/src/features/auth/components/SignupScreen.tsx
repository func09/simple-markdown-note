import { zodResolver } from "@hookform/resolvers/zod";
import { useSignup } from "@simple-markdown-note/api-client/hooks";
import type { SignupRequest } from "@simple-markdown-note/common/schemas";
import { SignupRequestSchema } from "@simple-markdown-note/common/schemas";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import { useAuthStore } from "../store";

/**
 * 新規登録画面
 * 内部でフォームの状態と登録ロジックを管理します。
 */
export function SignupScreen() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const emailId = useId();
  const passwordId = useId();

  const {
    mutate: signupMutate,
    isPending: isLoading,
    error: apiError,
  } = useSignup({
    onSuccess: (data) => {
      setAuth(data.user);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupRequest>({
    resolver: zodResolver(SignupRequestSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignupRequest) => {
    signupMutate(data, {
      onSuccess: () => {
        toast.success("Successfully signed up!");
        navigate("/notes?scope=all");
      },
      onError: (err: Error) => {
        toast.error(err.message || "Signup failed");
      },
    });
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="h-1.5 w-full bg-slate-900" />

          <CardHeader className="pb-4 pt-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-900 ring-1 ring-slate-200">
                <ShieldCheck size={28} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
              Create Account
            </CardTitle>
            <CardDescription className="mt-2 text-base text-slate-500">
              Start your note-taking journey
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-4"
            >
              {apiError && (
                <Alert
                  variant="destructive"
                  className="rounded-xl border-red-200 bg-red-50 text-red-600"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {apiError instanceof Error
                      ? apiError.message
                      : "Signup failed"}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor={emailId}
                  className="ml-1 text-sm font-medium text-slate-700"
                >
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900" />
                  <Input
                    {...register("email")}
                    id={emailId}
                    type="email"
                    placeholder="name@example.com"
                    className={`h-11 rounded-xl border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900/10 ${
                      errors.email
                        ? "border-red-500 focus-visible:ring-red-500/10"
                        : ""
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 ml-1 text-xs text-red-500 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor={passwordId}
                  className="ml-1 text-sm font-medium text-slate-700"
                >
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900" />
                  <Input
                    {...register("password")}
                    id={passwordId}
                    type="password"
                    placeholder="••••••••"
                    className={`h-11 rounded-xl border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900/10 ${
                      errors.password
                        ? "border-red-500 focus-visible:ring-red-500/10"
                        : ""
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 ml-1 text-xs text-red-500 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-4 h-11 w-full gap-2 rounded-xl bg-slate-900 font-bold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800"
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
                to="/login"
                className="font-semibold text-slate-900 hover:underline"
              >
                Sign In
              </Link>
            </div>
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-100 py-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Powered by Vite & Hono
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
