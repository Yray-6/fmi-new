import type { ReactNode } from "react";
import { AuthGuard } from "@/app/components/workspace/auth-guard";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
