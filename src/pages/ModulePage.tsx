import { Navigate, useParams } from "react-router-dom";
import { getModuleBySlug } from "@/content/modules";
import { LessonShell } from "@/components/lesson/LessonShell";

export function ModulePage() {
  const { slug } = useParams<{ slug: string }>();
  const module = slug ? getModuleBySlug(slug) : undefined;

  if (!module) {
    return <Navigate to="/" replace />;
  }

  return <LessonShell module={module} />;
}
