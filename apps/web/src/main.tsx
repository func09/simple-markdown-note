import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import LoginPage from "./pages/auth/LoginPage";
import PendingVerificationPage from "./pages/auth/PendingVerificationPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import SignupPage from "./pages/auth/SignupPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import IndexPage from "./pages/home/IndexPage";
import RootLayout from "./pages/layout/RootLayout";
import NoteDetailPage from "./pages/notes/NoteDetailPage";
import NotesPage from "./pages/notes/NotesPage";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const isElectron = typeof window !== "undefined" && Boolean(window.electron);
const Router = isElectron ? HashRouter : BrowserRouter;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<IndexPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/pending-verification"
            element={<PendingVerificationPage />}
          />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/notes/:noteId" element={<NoteDetailPage />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
