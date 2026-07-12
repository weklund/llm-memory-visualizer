import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/pages/HomePage";
import { ModulePage } from "@/pages/ModulePage";
import { ReferencesPage } from "@/pages/ReferencesPage";

/** Strip trailing slash from Vite BASE_URL for React Router basename */
const rawBase = import.meta.env.BASE_URL.replace(/\/$/, "");

export function App() {
  return (
    <BrowserRouter {...(rawBase ? { basename: rawBase } : {})}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="modules/:slug" element={<ModulePage />} />
          <Route path="references" element={<ReferencesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
