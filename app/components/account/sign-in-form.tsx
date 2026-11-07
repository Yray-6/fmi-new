"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { PasswordField, TextField } from "./password-field";
import { useSessionStore } from "@/lib/store/use-session-store";
import {
  DialogButton,
  FeedbackDialog,
  Note,
} from "@/app/components/workspace/marketplace/feedback-dialog";

type SignInError = {
  title: string;
  message: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function SignInForm() {
  const rememberId = useId();
  const router = useRouter();
  const login = useSessionStore((state) => state.login);
  const rememberedEmail = useSessionStore((state) => state.rememberedEmail);
  const status = useSessionStore((state) => state.status);
  const hydrate = useSessionStore((state) => state.hydrate);
  const hasHydrated = useSessionStore((state) => state._hasHydrated);
  const isVerifying = useSessionStore((state) => state.isVerifying);
  const sessionChecked = useSessionStore((state) => state.sessionChecked);

  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [rememberDraft, setRememberDraft] = useState<boolean | null>(null);
  const [errorDialog, setErrorDialog] = useState<SignInError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const email = emailDraft ?? rememberedEmail;
  const rememberEmail = rememberDraft ?? !!rememberedEmail;

  useEffect(() => {
    if (!hasHydrated || sessionChecked || status === "loading") return;
    void hydrate();
  }, [hasHydrated, sessionChecked, status, hydrate]);

  useEffect(() => {
    if (!hasHydrated || !sessionChecked || isVerifying) return;
    if (status === "authenticated") {
      router.replace("/overview");
    }
  }, [hasHydrated, sessionChecked, isVerifying, status, router]);

  function showError(title: string, message: string) {
    setErrorDialog({ title, message });
  }

  return (
    <>
      <form
        className="flex w-full flex-col lg:max-w-[432px] lg:gap-8"
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();

          const form = new FormData(event.currentTarget);
          const nextEmail = String(form.get("email") || "").trim();
          const password = String(form.get("password") || "");

          if (!nextEmail) {
            showError(
              "Email required",
              "Enter the email address for your investor account.",
            );
            return;
          }

          if (!isValidEmail(nextEmail)) {
            showError(
              "Check your email",
              "Enter a valid email address to continue.",
            );
            return;
          }

          if (!password) {
            showError(
              "Password required",
              "Enter your password to sign in to your workspace.",
            );
            return;
          }

          setSubmitting(true);
          try {
            await login(nextEmail, password, rememberEmail);
            router.push("/overview");
          } catch (err) {
            const message =
              err instanceof Error && err.message
                ? err.message
                : "We couldn’t verify those details. Check your email and password, then try again.";
            showError("Couldn’t sign you in", message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div className="flex flex-col gap-2.5 bg-[#F4F9F6] px-6 py-7 lg:bg-transparent lg:p-0">
          <p className="text-xs font-semibold leading-[18px] text-accent lg:leading-4">
            INVESTOR ACCESS
          </p>
          <h1 className="font-[family-name:var(--font-stack-sans)] text-base font-normal leading-[1.2] text-[#14271F] lg:text-[34px]">
            Welcome back.
          </h1>
          <p className="text-sm leading-[25px] text-[#53645B] lg:text-[17px] lg:leading-[1.45]">
            Sign in to your FMI investor workspace.
          </p>
        </div>

        <div className="flex flex-col gap-7 px-6 py-7 lg:gap-8 lg:p-0">
        <div className="flex flex-col gap-[22px]">
          <TextField
            label="Email address"
            type="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={setEmailDraft}
            required={false}
          />
          <PasswordField
            placeholder="Enter your password"
            autoComplete="current-password"
            required={false}
          />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <label
              htmlFor={rememberId}
              className="flex items-center gap-2 text-xs leading-6 text-[#53645B] lg:gap-[9px] lg:text-sm"
            >
              <span className="relative inline-flex shrink-0">
                <input
                  id={rememberId}
                  name="remember"
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(event) => setRememberDraft(event.target.checked)}
                  className="peer size-[17px] appearance-none rounded border border-[#D9E5DD] bg-white checked:border-accent checked:bg-accent"
                />
                <svg
                  viewBox="0 0 12 12"
                  aria-hidden
                  className="pointer-events-none absolute inset-0 m-auto hidden size-2.5 text-white peer-checked:block"
                >
                  <path
                    d="M2 6.2 4.6 8.8 10 3.2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Remember my email
            </label>
            <a
              href="#"
              className="text-xs leading-6 text-accent hover:underline lg:text-[15px]"
            >
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-[52px] w-full items-center justify-center rounded-lg bg-accent text-sm font-semibold leading-6 text-white hover:brightness-95 disabled:opacity-60 lg:text-base"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </div>

        <p className="flex items-center justify-center gap-2 text-xs leading-5 text-[#718078] lg:text-[13px]">
          <img
            src="/auth/icon-lock.svg"
            alt=""
            width={15}
            height={15}
            aria-hidden
            className="h-3 w-3 lg:h-[15px] lg:w-[15px]"
          />
          Secure access to your investor account
        </p>
        </div>
      </form>

      {errorDialog ? (
        <FeedbackDialog
          eyebrow="SIGN IN / REQUEST FAILURE"
          title={errorDialog.title}
          onClose={() => setErrorDialog(null)}
          showClose
          placement="center"
          actions={
            <DialogButton tone="primary" onClick={() => setErrorDialog(null)}>
              Try again
            </DialogButton>
          }
        >
          <Note tone="failure">
            <span className="text-base font-semibold text-[#14271F]">
              {errorDialog.message}
            </span>
          </Note>
        </FeedbackDialog>
      ) : null}
    </>
  );
}
