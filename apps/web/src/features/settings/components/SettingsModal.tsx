import { useLogout } from "@simple-markdown-note/api-client/hooks";
import { LogOut } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/features/auth";
import { useNotesStore } from "@/features/notes/store";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { clearAuth } = useAuthStore();
  const { resetFilters, setSelectedNoteId } = useNotesStore();
  const user = useAuthStore((state) => state.user);

  const logoutMutation = useLogout({
    onSuccess() {
      clearAuth();
      resetFilters();
      setSelectedNoteId(null);
      onOpenChange(false);
    },
  });

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <h3 className="mb-4 text-sm font-medium text-slate-500">
                Account
              </h3>
              <div className="flex flex-col gap-4 text-sm border rounded-lg bg-slate-50 p-4">
                <dl className="flex items-center justify-between">
                  <dt className="font-medium text-slate-900">Email</dt>
                  <dd className="text-slate-500 truncate min-w-0 max-w-[60%] sm:max-w-[75%] text-right">
                    {user?.email || "Not logged in"}
                  </dd>
                </dl>
                <Separator />
                <dl className="flex items-center justify-between">
                  <dt className="font-medium text-slate-900">Action</dt>
                  <dd>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="gap-2 shrink-0"
                    >
                      <LogOut className="w-4 h-4" />
                      {logoutMutation.isPending ? "Logging out..." : "Logout"}
                    </Button>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
