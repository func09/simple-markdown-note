import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "@simple-markdown-note/api-client/hooks";
import type { ForgotPasswordRequest } from "@simple-markdown-note/schemas";
import { ForgotPasswordRequestSchema } from "@simple-markdown-note/schemas";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
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
/**
 * パスワードを忘れたユーザーに向けてリセット用リンクを送信する画面コンポーネント。
 * 入力されたメールアドレス宛にAPI経由で検証メールの発行をリクエストします。
 */
export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const emailId = useId();

  const {
    mutate: forgotPasswordMutate,
    isPending: isLoading,
    error: apiError,
  } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(ForgotPasswordRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordRequest) => {
    forgotPasswordMutate(data, {
      onSuccess: () => {
        toast.success("Check your email for a password reset link");
        navigate("/login");
      },
      onError: (err: Error) => {
        toast.error(err.message || "Failed to send reset link");
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
              Forgot Password
            </CardTitle>
            <CardDescription className="mt-2 text-base text-slate-500">
              Enter your email to receive a reset link
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
                      : "Failed to send reset link"}
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

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-4 h-11 w-full gap-2 rounded-xl bg-slate-900 font-bold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-slate-900 flex items-center justify-center gap-1 mt-2 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
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
