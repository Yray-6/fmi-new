import type { Metadata } from "next";
import { SignInForm } from "@/app/components/account/sign-in-form";
import { WorkspacePanel } from "@/app/components/account/workspace-panel";

export const metadata: Metadata = {
  title: "Sign in · FMI",
  description: "Sign in to your FMI investor workspace.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[1440px] flex-col lg:flex-row lg:items-center lg:gap-10 lg:px-8 lg:py-7 xl:gap-16">
      <WorkspacePanel />
      <div className="flex w-full justify-center lg:order-2 lg:w-[432px] lg:shrink-0 xl:w-auto xl:flex-1 xl:pr-16">
        <SignInForm />
      </div>
    </div>
  );
}
