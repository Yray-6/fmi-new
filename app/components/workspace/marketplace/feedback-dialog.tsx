"use client";

import Link from "next/link";
import { useEffect, useId, useRef, type ReactNode } from "react";

export function FeedbackDialog({
  eyebrow,
  title,
  onClose,
  children,
  actions,
  showClose = false,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions: ReactNode;
  showClose?: boolean;
  placement?: "sheet" | "center";
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement;
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#14271F]/40 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem)] min-h-0 w-full max-w-[560px] flex-col overflow-hidden rounded-[14px] border border-[#D9E5DD] bg-white outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 flex-col gap-3 px-5 pt-5 sm:gap-5 sm:px-7 sm:pt-7">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 break-words text-xs font-semibold leading-[1.4] text-accent">
              {eyebrow}
            </p>
            {showClose ? (
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[#53645B] hover:bg-[#F4F9F6]"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path
                    d="M4.5 4.5 13.5 13.5M13.5 4.5 4.5 13.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            ) : null}
          </div>
          <h2
            id={titleId}
            className="break-words font-[family-name:var(--font-stack-sans)] text-[22px] font-normal leading-[1.25] text-[#14271F] sm:text-[25px]"
          >
            {title}
          </h2>
        </div>
        <div className="flex min-h-0 flex-auto flex-col gap-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
          {children}
        </div>
        <div className="shrink-0 px-5 pb-5 sm:px-7 sm:pb-7">
          <div className="h-px bg-[#D9E5DD]" />
          <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-end [&>*]:w-full [&>*]:justify-center sm:[&>*]:w-auto">
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DialogButton({
  children,
  onClick,
  href,
  tone = "secondary",
  disabled = false,
}: {
  children: string;
  onClick?: () => void | Promise<void>;
  href?: string;
  tone?: "primary" | "secondary";
  disabled?: boolean;
}) {
  const className = `inline-flex max-w-full items-center justify-center whitespace-normal rounded-lg border px-[18px] py-[11px] text-center text-base font-semibold leading-[1.4] disabled:cursor-not-allowed disabled:opacity-60 ${
    tone === "primary"
      ? "border-accent bg-accent text-white"
      : "border-[#D9E5DD] bg-white text-[#14271F]"
  }`;

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Choice({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-[1.4] text-[#14271F]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={`mt-0.5 flex size-[19px] shrink-0 items-center justify-center rounded border ${
          checked ? "border-accent bg-accent text-white" : "border-[#D9E5DD] bg-white"
        }`}
        aria-hidden
      >
        {checked ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 7.2 5.6 9.8 11 4.2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      {label}
    </label>
  );
}

export function Note({
  tone = "success",
  title,
  children,
}: {
  tone?: "success" | "failure" | "warning";
  title?: string;
  children: ReactNode;
}) {
  const background =
    tone === "failure" ? "bg-[#FCF0EE]" : tone === "warning" ? "bg-[#FBF3E5]" : "bg-[#E8F7EC]";
  return (
    <div className={`rounded-[10px] px-4 py-4 text-sm leading-[1.5] text-[#53645B] ${background}`}>
      {title ? <p className="font-semibold text-[#14271F]">{title}</p> : null}
      <p>{children}</p>
    </div>
  );
}
