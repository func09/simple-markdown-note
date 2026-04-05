import { useVerifyEmail } from "@simple-markdown-note/api-client/hooks";
import { AlertCircle, CheckCircle2, Loader2, NotebookPen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "../store";

export function VerifyEmailScreen() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const hasCalledRef = useRef(false);

  const { mutate: verify } = useVerifyEmail({
    onSuccess: () => {
      // キャッシュを削除してから user をリセット。
      // これにより AuthInitializer の useMe がサーバーから最新の
      // status: "active" を再取得し、AuthGuard が pending 判定しなくなる。
      queryClient.removeQueries({ queryKey: ["auth", "me"] });
      useAuthStore.setState({ user: null });
      setStatus("success");
    },
    onError: (err) => {
      setStatus("error");
      setErrorMsg(
        err.message ||
          "Failed to verify email. The link might be invalid or expired."
      );
    },
  });

  useEffect(() => {
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    if (!token) {
      setStatus("error");
      setErrorMsg("No verification token provided in the URL.");
      return;
    }

    verify(token);
  }, [token, verify]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="h-1.5 w-full bg-slate-900" />

          <CardHeader className="pb-4 pt-10 text-center">
            <div className="flex justify-center mb-6">
              {status === "loading" && (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-900 ring-1 ring-slate-200">
                  <Loader2 size={28} className="animate-spin" />
                </div>
              )}
              {status === "success" && (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 ring-1 ring-green-200">
                  <CheckCircle2 size={28} />
                </div>
              )}
              {status === "error" && (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 ring-1 ring-red-200">
                  <AlertCircle size={28} />
                </div>
              )}
            </div>

            <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
              {status === "loading" && "Verifying Email"}
              {status === "success" && "Verification Complete"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
          </CardHeader>

          <CardContent className="px-8 pb-8 text-center space-y-6">
            {status === "loading" && (
              <p className="text-slate-600 text-sm">
                Please wait while we verify your email address...
              </p>
            )}

            {status === "success" && (
              <>
                <p className="text-slate-600 text-sm">
                  Your email has been successfully verified! You can now access
                  your notes.
                </p>
                <Button
                  onClick={() => navigate("/notes?scope=all")}
                  className="mt-4 h-11 w-full gap-2 rounded-xl bg-slate-900 font-bold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800"
                >
                  <NotebookPen className="h-5 w-5" />
                  Go to Notes
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <Alert
                  variant="destructive"
                  className="rounded-xl border-red-200 bg-red-50 text-red-600 text-left"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <p className="text-sm text-slate-600">
                    If your link has expired, you can log in to request a new
                    one.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => navigate("/login")}
                  >
                    Go to Login
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
