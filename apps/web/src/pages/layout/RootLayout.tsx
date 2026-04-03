import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers/Providers";
import "../index.css";

export default function RootLayout() {
  return (
    <Providers>
      <div className="min-h-full flex flex-col flex-1">
        <Outlet />
      </div>
      <Toaster position="top-center" expand visibleToasts={3} />
    </Providers>
  );
}
