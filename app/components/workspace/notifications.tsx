"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from "@/hooks/use-notifications";
import { useSlide } from "./use-slide";

export function NotificationControl({
  menuOpen,
  onMenu,
}: {
  menuOpen: boolean;
  onMenu: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { mounted, shown } = useSlide(open);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const notificationsQuery = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const notices = notificationsQuery.data || [];
  const [markedAll, setMarkedAll] = useState(false);
  const titleId = useId();
  const drawerId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const unreadCount = notices.filter((notice) => notice.unread).length;
  const visible =
    tab === "unread" ? notices.filter((notice) => notice.unread) : notices;

  useEffect(() => {
    if (!mounted) return;
    const previous = document.activeElement;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [mounted]);

  useEffect(() => {
    if (unreadCount > 0) setMarkedAll(false);
  }, [unreadCount]);

  function markAllRead() {
    markAll.mutate(notices, {
      onSuccess: () => setMarkedAll(true),
    });
  }

  return (
    <>
      <button
        type="button"
        className="shrink-0"
        aria-label={
          unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
        }
        aria-expanded={open}
        aria-controls={drawerId}
        onClick={() => {
          if (menuOpen) onMenu();
          setOpen(true);
        }}
      >
        <img
          src={
            unreadCount > 0
              ? "/workspace/icon-notifications.svg"
              : "/workspace/icon-notifications-quiet.svg"
          }
          alt=""
          width={28}
          height={28}
        />
      </button>

      {mounted ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:block sm:p-0">
          <button
            type="button"
            className={`absolute inset-0 bg-[#14271F]/20 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
              shown ? "opacity-100" : "opacity-0"
            }`}
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <section
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`relative z-10 flex max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem)] w-full max-w-[420px] flex-col gap-5 overflow-y-auto overscroll-contain rounded-[14px] border border-[#D9E5DD] bg-white p-5 shadow-[0_12px_40px_rgba(20,39,31,0.12)] transition duration-300 ease-out motion-reduce:transition-none sm:absolute sm:inset-y-0 sm:right-0 sm:max-h-none sm:w-full sm:max-w-[390px] sm:rounded-none sm:rounded-l-3xl sm:border-y-0 sm:border-r-0 sm:shadow-[-12px_0_32px_rgba(20,39,31,0.08)] ${
              shown
                ? "translate-y-0 opacity-100 sm:translate-x-0"
                : "translate-y-3 opacity-0 sm:translate-x-full sm:translate-y-0 sm:opacity-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <h2
                id={titleId}
                className="min-w-0 flex-1 break-words font-[family-name:var(--font-stack-sans)] text-[22px] font-normal leading-[1.25] text-[#14271F] sm:text-[26px]"
              >
                Notifications
              </h2>
              <button
                ref={closeRef}
                type="button"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#D9E5DD] outline-none focus-visible:border-accent"
                aria-label="Close notifications"
                onClick={() => setOpen(false)}
              >
                <img src="/workspace/icon-close.svg" alt="" width={20} height={20} />
              </button>
            </div>

            {notificationsQuery.isError ? (
              <p className="text-sm leading-[1.7] text-[#F43939]">
                {notificationsQuery.error instanceof Error
                  ? notificationsQuery.error.message
                  : "Could not load notifications."}
              </p>
            ) : null}

            {unreadCount > 0 && tab === "all" ? (
              <div className="flex flex-wrap items-center gap-2">
                <p className="rounded-[5px] bg-[#E8F7EC] px-[9px] py-[5px] text-[13px] leading-[1.4] text-accent">
                  {unreadCount} unread
                </p>
                <button
                  type="button"
                  className="text-sm leading-[1.4] text-accent"
                  onClick={markAllRead}
                >
                  Mark all as read
                </button>
              </div>
            ) : (
              <p className="text-[15px] leading-[1.7] text-[#14271F]">
                {tab === "all"
                  ? notices.length === 0
                    ? notificationsQuery.isLoading
                      ? "Loading…"
                      : "No notifications yet"
                    : "All marked as read"
                  : `${unreadCount} unread`}
              </p>
            )}

            <div
              role="tablist"
              aria-label="Notification views"
              className="flex gap-6 border-b border-[#D9E5DD]"
            >
              <TabButton
                label="All"
                selected={tab === "all"}
                onClick={() => setTab("all")}
              />
              <TabButton
                label="Unread"
                selected={tab === "unread"}
                onClick={() => setTab("unread")}
              />
            </div>

            {tab === "all" && notices.length === 0 && !notificationsQuery.isLoading ? (
              <p className="text-sm leading-[1.7] text-[#53645B]">
                Capital activity and transfer updates will appear here.
              </p>
            ) : null}

            {tab === "unread" && visible.length === 0 ? (
              <>
                <div className="flex flex-col gap-1 rounded-[10px] bg-[#E8F7EC] p-4 text-sm leading-[1.7] text-[#53645B]">
                  <p className="font-semibold text-[#14271F]">
                    All notifications marked as read
                  </p>
                  <p>
                    There are no unread investment, payout, or transfer
                    notifications. Read activity is still available in All.
                  </p>
                </div>
                <p className="text-[15px] leading-[1.7] text-[#14271F]">
                  New account updates will appear here. Mandatory security and
                  regulatory notices remain enabled.
                </p>
              </>
            ) : (
              <ul className="flex flex-col gap-5">
                {visible.map((notice) => (
                  <li key={notice.id}>
                    <article
                      className={`flex items-start gap-3 rounded-[10px] p-3.5 ${
                        notice.unread
                          ? "border border-[#D9E5DD] bg-[#F4F9F6]"
                          : "bg-white"
                      }`}
                    >
                      <img
                        src={notice.icon}
                        alt=""
                        width={20}
                        height={20}
                        className="shrink-0"
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`min-w-0 flex-1 text-[15px] leading-[1.4] text-[#14271F] ${
                              notice.unread ? "font-semibold" : "font-medium"
                            }`}
                          >
                            {notice.title}
                          </h3>
                          {notice.unread ? (
                            <span
                              className="size-[7px] shrink-0 rounded-full bg-accent"
                              aria-hidden
                            />
                          ) : null}
                        </div>
                        <p className="text-sm leading-[1.7] text-[#53645B]">{notice.body}</p>
                        <p className="text-sm leading-[1.7] text-[#718078]">
                          {notice.meta}
                          {markedAll ? " · Read" : ""}
                        </p>
                        {markedAll ? null : (
                          <p>
                            {notice.href ? (
                              <Link
                                href={notice.href}
                                className="text-sm leading-[1.7] text-accent"
                                onClick={() => setOpen(false)}
                              >
                                {notice.action} →
                              </Link>
                            ) : (
                              <button
                                type="button"
                                className="text-sm leading-[1.7] text-accent"
                              >
                                {notice.action} →
                              </button>
                            )}
                          </p>
                        )}
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            )}

            <div className="h-px bg-[#D9E5DD]" />
            {tab === "all" && unreadCount > 0 ? (
              <p className="text-[13px] leading-[1.4] text-[#53645B]">
                Security and regulatory notices stay enabled. Optional preferences
                can be managed in{" "}
                <Link
                  href="/account?view=notifications"
                  className="text-accent"
                  onClick={() => setOpen(false)}
                >
                  Account & security
                </Link>
                .
              </p>
            ) : null}

            {tab === "unread" && visible.length === 0 ? (
              <>
                <DrawerButton onClick={() => setOpen(false)}>Close</DrawerButton>
                <DrawerButton tone="primary" onClick={() => setTab("all")}>
                  View all notifications
                </DrawerButton>
              </>
            ) : tab === "unread" ? (
              <>
                <DrawerButton onClick={() => setOpen(false)}>Close</DrawerButton>
                <DrawerButton tone="primary" onClick={markAllRead}>
                  Mark all as read
                </DrawerButton>
              </>
            ) : unreadCount === 0 ? (
              <>
                <DrawerButton onClick={() => setOpen(false)}>Close</DrawerButton>
                <DrawerButton
                  tone="primary"
                  href="/account?view=notifications"
                  onClick={() => setOpen(false)}
                >
                  Notification preferences
                </DrawerButton>
              </>
            ) : (
              <DrawerButton
                href="/account?view=notifications"
                onClick={() => setOpen(false)}
              >
                Notification preferences
              </DrawerButton>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}

function TabButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={`-mb-px whitespace-nowrap border-b-2 py-[13px] text-base leading-6 ${
        selected
          ? "border-accent font-semibold text-accent"
          : "border-transparent font-normal text-[#53645B]"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function DrawerButton({
  children,
  tone = "outline",
  href,
  onClick,
}: {
  children: string;
  tone?: "outline" | "primary";
  href?: string;
  onClick?: () => void;
}) {
  const className =
    tone === "primary"
      ? "inline-flex w-full items-center justify-center rounded-lg border border-accent bg-accent px-4 py-3 text-base font-semibold leading-[1.4] text-white"
      : "inline-flex w-full items-center justify-center rounded-lg border border-[#D9E5DD] bg-white px-4 py-3 text-base font-semibold leading-[1.4] text-[#14271F]";

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
}
