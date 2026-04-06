import { useResendVerification } from "@simple-markdown-note/api-client/hooks";
import { Loader2, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "../store";
/**
 * 新規登録後のメールアドレス有効化（認証）待ち画面コンポーネント。
 * ユーザーにメールの確認を促し、リンク未着時の再送アクション等を提供します。
 */
export function PendingVerificationScreen() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const { mutate: resend, isPending } = useResendVerification();

  const handleResend = () => {
    if (!user?.email) return;
    resend(
      { email: user.email },
      {
        onSuccess: () => {
          toast.success("Verification email has been resent!");
        },
        onError: () => {
          toast.error("Failed to resend verification email.");
        },
      }
    );
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="h-1.5 w-full bg-slate-900" />
          <CardHeader className="pb-4 pt-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-900 ring-1 ring-slate-200">
                <Mail size={28} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
              Check your email
            </CardTitle>
            <CardDescription className="mt-2 text-base text-slate-500">
              We've sent a verification email to your address.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 text-center space-y-6">
            <p className="text-slate-600 text-sm">
              Please check your inbox and click the verification link to
              activate your account. If you don't see it, check your spam
              folder.
            </p>

            <Button
              onClick={handleResend}
              disabled={isPending || !user?.email}
              variant="outline"
              className="mt-4 h-11 w-full gap-2 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>
            <div className="pt-4 border-t border-slate-100">
              <Button variant="link" onClick={handleLogout}>
                Go back to login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
