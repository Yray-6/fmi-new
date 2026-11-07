"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useAccountActivity,
  useAccountDocuments,
  useAccountProfile,
  useAccountSessions,
  useChangePassword,
  useDeleteAccountDocument,
  useNotificationFlags,
  useRevokeSession,
  useUpdateAccountProfile,
  useUpdateNotificationFlags,
  useUploadAccountDocument,
  downloadAccountDocument,
} from "@/hooks/use-account";
import { downloadText } from "../portfolio/data";
import {
  DialogButton,
  FeedbackDialog,
  Note,
} from "../marketplace/feedback-dialog";
import {
  accountViews,
  formatStamp,
  parseView,
  profileErrors,
  sameProfile,
  viewHref,
  type AccountView,
  type Profile,
} from "./data";

type DialogState =
  | { type: "save-profile" }
  | { type: "unchanged-profile" }
  | { type: "password" }
  | { type: "revoke"; sessionId: string }
  | { type: "sign-out-others" }
  | { type: "no-other-sessions" }
  | null;

const panelClass =
  "flex min-w-0 flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 lg:p-[22px]";

function trimmed(profile: Profile): Profile {
  return {
    firstName: profile.firstName.trim(),
    lastName: profile.lastName.trim(),
    email: profile.email.trim(),
    mobile: profile.mobile.trim(),
  };
}

function PanelLink({
  children,
  onClick,
}: {
  children: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="shrink-0 text-sm text-accent">
      {children}
    </button>
  );
}

function ProfileField({
  label,
  value,
  error,
  type = "text",
  autoComplete,
  readOnly = false,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  type?: string;
  autoComplete: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
}) {
  const errorId = `${label.replace(/\s+/g, "-").toLowerCase()}-error`;
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[13px] leading-[1.35] text-[#718078]">{label}</span>
      <input
        type={type}
        readOnly={readOnly}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`rounded-lg border bg-white px-3 py-[11px] text-[15px] leading-6 text-[#14271F] outline-none focus:border-accent ${
          error ? "border-[#8A3E36]" : "border-[#D9E5DD]"
        } ${readOnly ? "bg-[#F4F9F6] text-[#53645B]" : ""}`}
      />
      {error ? (
        <span id={errorId} className="text-xs leading-[1.4] text-[#8A3E36]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function DetailLine({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
      <p className="text-[15px] leading-6 text-[#53645B]">{label}</p>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="w-fit text-left text-[15px] font-semibold leading-6 text-[#14271F] lg:text-right"
        >
          {value}
        </button>
      ) : (
        <p className="text-[15px] font-semibold leading-6 text-[#14271F] lg:text-right">
          {value}
        </p>
      )}
    </div>
  );
}

function PasswordDialog({
  onClose,
  onSaved,
  onSubmit,
}: {
  onClose: () => void;
  onSaved: (stamp: string) => void;
  onSubmit: (input: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  async function submit() {
    if (current.trim().length < 8) {
      setError("Enter your current password (8 or more characters).");
      return;
    }
    if (next.length < 8) {
      setError("Choose a new password of at least 8 characters.");
      return;
    }
    if (next === current) {
      setError("Choose a new password that differs from the current one.");
      return;
    }
    if (next !== confirm) {
      setError("New password and confirmation do not match.");
      return;
    }
    try {
      await onSubmit({
        oldPassword: current,
        newPassword: next,
        confirmPassword: confirm,
      });
      const stamp = formatStamp(new Date());
      setSaved(stamp);
      onSaved(stamp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change the password.");
    }
  }

  if (saved) {
    return (
      <FeedbackDialog
        eyebrow="SECURITY / PASSWORD"
        title="Password updated"
        onClose={onClose}
        showClose
        actions={<DialogButton onClick={onClose}>Close</DialogButton>}
      >
        <Note>Password last changed {saved}.</Note>
      </FeedbackDialog>
    );
  }

  return (
    <FeedbackDialog
      eyebrow="SECURITY / PASSWORD"
      title="Change your password"
      onClose={onClose}
      showClose
      actions={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton tone="primary" onClick={submit}>
            Update password
          </DialogButton>
        </>
      }
    >
      {(
        [
          ["Current password", current, setCurrent, "current-password"],
          ["New password", next, setNext, "new-password"],
          ["Confirm new password", confirm, setConfirm, "new-password"],
        ] as const
      ).map(([label, value, setValue, autoComplete]) => (
        <label key={label} className="flex flex-col gap-1.5">
          <span className="text-[13px] leading-[1.35] text-[#718078]">{label}</span>
          <input
            type="password"
            value={value}
            autoComplete={autoComplete}
            onChange={(event) => {
              setValue(event.target.value);
              setError("");
            }}
            className="rounded-lg border border-[#D9E5DD] bg-white px-3 py-[11px] text-[15px] text-[#14271F] outline-none focus:border-accent"
          />
        </label>
      ))}
      {error ? <p className="text-[13px] leading-[1.4] text-[#8A3E36]">{error}</p> : null}
      <Note>FMI will never ask for this password in a message.</Note>
    </FeedbackDialog>
  );
}

const emptyProfile: Profile = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
};

export function Account() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawView = searchParams.get("view");
  const view = parseView(rawView === "identity" ? "overview" : rawView);
  const profileQuery = useAccountProfile();
  const updateProfile = useUpdateAccountProfile();
  const passwordMutation = useChangePassword();
  const sessionsQuery = useAccountSessions();
  const revokeMutation = useRevokeSession();
  const documentsQuery = useAccountDocuments();
  const uploadDocument = useUploadAccountDocument();
  const deleteDocument = useDeleteAccountDocument();
  const activityQuery = useAccountActivity();
  const notificationsQuery = useNotificationFlags();
  const updateNotifications = useUpdateNotificationFlags();
  const [draft, setDraft] = useState<Profile>(emptyProfile);
  const [saved, setSaved] = useState<Profile>(emptyProfile);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});
  const [profileNote, setProfileNote] = useState("");
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [preferenceNote, setPreferenceNote] = useState("");
  const [passwordChanged, setPasswordChanged] = useState("Not recorded");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const sessions = sessionsQuery.data || [];
  const documents = documentsQuery.data || [];
  const notificationFlags = notificationsQuery.data || [];
  const investorId = profileQuery.data ? `FMI-${profileQuery.data.id}` : "—";
  const residence = profileQuery.data?.country || "Not provided";
  const investorType =
    profileQuery.data?.investorTypeDisplay ||
    profileQuery.data?.investorType ||
    "Not provided";
  const isVerified = Boolean(profileQuery.data?.isVerified);

  useEffect(() => {
    if (!profileQuery.data) return;
    const next: Profile = {
      firstName: profileQuery.data.firstName,
      lastName: profileQuery.data.lastName,
      email: profileQuery.data.email,
      mobile: profileQuery.data.mobile,
    };
    setSaved(next);
    setDraft((current) => (current.email ? current : next));
  }, [profileQuery.data]);

  useEffect(() => {
    if (!notificationsQuery.data) return;
    setPreferences(
      Object.fromEntries(
        notificationsQuery.data.map((flag) => [flag.id, flag.enabled]),
      ),
    );
  }, [notificationsQuery.data]);

  function selectView(next: AccountView, anchor?: string) {
    router.push(viewHref(next), { scroll: false });
    if (!anchor) return;
    window.setTimeout(() => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function updateField(key: keyof Profile, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setProfileNote("");
  }

  function requestSave() {
    const nextErrors = profileErrors(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setDialog(sameProfile(draft, saved) ? { type: "unchanged-profile" } : { type: "save-profile" });
  }

  async function commitProfile() {
    if (!profileQuery.data) return;
    const next = trimmed(draft);
    try {
      const updated = await updateProfile.mutateAsync({
        ...profileQuery.data,
        firstName: next.firstName,
        lastName: next.lastName,
        mobile: next.mobile,
      });
      const savedProfile: Profile = {
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        mobile: updated.mobile,
      };
      setDraft(savedProfile);
      setSaved(savedProfile);
      setProfileNote("Changes saved.");
      setDialog(null);
    } catch (error) {
      setProfileNote(error instanceof Error ? error.message : "Could not save the profile.");
      setDialog(null);
    }
  }

  async function savePreferences() {
    if (notificationFlags.length === 0) {
      setPreferenceNote("Notification preferences were not returned by the account API.");
      return;
    }
    const unchanged = notificationFlags.every(
      (item) => preferences[item.id] === item.enabled,
    );
    if (unchanged) {
      setPreferenceNote("Preferences are already saved.");
      return;
    }
    try {
      await updateNotifications.mutateAsync(
        notificationFlags.map((item) => ({
          ...item,
          enabled: preferences[item.id] ?? item.enabled,
        })),
      );
      setPreferenceNote("Preferences saved.");
    } catch (error) {
      setPreferenceNote(
        error instanceof Error ? error.message : "Could not save preferences.",
      );
    }
  }

  function otherSessions() {
    return sessions.filter((session) => !session.current);
  }

  function requestSignOutOthers() {
    setDialog(
      otherSessions().length > 0
        ? { type: "sign-out-others" }
        : { type: "no-other-sessions" },
    );
  }

  async function revoke(sessionId: string) {
    try {
      await revokeMutation.mutateAsync(sessionId);
      setDialog(null);
    } catch (error) {
      setProfileNote(error instanceof Error ? error.message : "Could not revoke the session.");
      setDialog(null);
    }
  }

  function downloadDocument(document: (typeof documents)[number]) {
    downloadAccountDocument(document.id, `${document.title}.bin`).catch(() => {
      downloadText(document.title, `${document.title}\n${document.meta}\n`);
    });
  }

  const showBanner = view === "overview";
  const showProfile = view === "overview";
  const showSecurity = view === "overview" || view === "security";
  const showNotifications = view === "overview" || view === "notifications";
  const showSessions = view === "overview" || view === "security";
  const showDocuments = view === "overview" || view === "documents";
  const revokeTarget =
    dialog?.type === "revoke"
      ? sessions.find((session) => session.id === dialog.sessionId)
      : undefined;

  return (
    <div className="flex w-full min-w-0 flex-col gap-[22px] px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-[640px] flex-col gap-[5px]">
          <p className="text-xs font-semibold text-accent">SETTINGS / ACCOUNT & SECURITY</p>
          <h1 className="font-[family-name:var(--font-stack-sans)] text-[28px] font-normal leading-[1.2] text-[#14271F] lg:text-[32px]">
            Confidence starts with control.
          </h1>
          <p className="text-base leading-[1.4] text-[#53645B]">
            Manage your profile, security, documents and notification preferences.
          </p>
        </div>
      </div>

      <div
        className="flex flex-wrap gap-x-2 border-b border-[#D9E5DD] lg:flex-nowrap lg:gap-x-[26px]"
        role="tablist"
      >
        {accountViews.map((item) => {
          const active = item.id === view;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectView(item.id)}
              className={`border-b-2 py-[11px] text-left text-base leading-6 lg:shrink-0 ${
                active
                  ? "border-accent font-semibold text-accent"
                  : "border-transparent text-[#53645B] hover:text-[#14271F]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {showBanner ? (
        <section className="flex flex-col gap-5 rounded-[14px] bg-[#0B2118] p-4 lg:flex-row lg:items-center lg:p-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#204331]">
            <img src="/workspace/icon-shield-check.svg" alt="" width={26} height={26} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2 className="font-[family-name:var(--font-stack-sans)] text-[22px] font-normal text-white">
              {isVerified ? "Your account is verified." : "Verification status from your profile."}
            </h2>
            <p className="text-[15px] leading-6 text-[#A8C5B2]">
              {isVerified ? "Verified" : "Not verified"} · Investor type · {investorType}
            </p>
          </div>
        </section>
      ) : null}

      {view === "overview" ? (
        <section className={panelClass}>
          <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal text-[#14271F]">
            Recent activity
          </h2>
          {(activityQuery.data || []).length === 0 ? (
            <p className="text-sm text-[#53645B]">
              {activityQuery.isLoading ? "Loading activity…" : "No account activity yet."}
            </p>
          ) : (
            (activityQuery.data || []).slice(0, 5).map((item) => (
              <div key={item.id} className="border-b border-[#D9E5DD] py-2">
                <p className="text-sm font-semibold text-[#14271F]">{item.title}</p>
                <p className="text-xs text-[#718078]">{item.meta}</p>
              </div>
            ))
          )}
        </section>
      ) : null}

      {showProfile ? (
        <form
          className={panelClass}
          onSubmit={(event) => {
            event.preventDefault();
            requestSave();
          }}
        >
          <div className="flex flex-col items-start gap-1 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-3">
            <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-snug text-[#14271F]">
              Your profile
            </h2>
            <p className="text-sm text-accent">Investor ID · {investorId}</p>
          </div>
          <div className="grid gap-3.5 lg:grid-cols-2">
            <ProfileField
              label="Legal first name"
              value={draft.firstName}
              error={errors.firstName}
              autoComplete="given-name"
              onChange={(value) => updateField("firstName", value)}
            />
            <ProfileField
              label="Legal last name"
              value={draft.lastName}
              error={errors.lastName}
              autoComplete="family-name"
              onChange={(value) => updateField("lastName", value)}
            />
          </div>
          <div className="grid gap-3.5 lg:grid-cols-2">
            <ProfileField
              label="Email address"
              type="email"
              readOnly
              value={draft.email}
              error={errors.email}
              autoComplete="email"
              onChange={(value) => updateField("email", value)}
            />
            <ProfileField
              label="Mobile number"
              type="tel"
              value={draft.mobile}
              error={errors.mobile}
              autoComplete="tel"
              onChange={(value) => updateField("mobile", value)}
            />
          </div>
          <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            <p className="text-[15px] leading-6 text-[#53645B]">Residence / tax jurisdiction</p>
            <p className="text-[15px] font-semibold leading-6 text-[#14271F]">{residence}</p>
          </div>
          <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            <p className="text-[15px] leading-6 text-[#53645B]">Investor type</p>
            <p className="text-[15px] font-semibold leading-6 text-[#14271F]">{investorType}</p>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              {profileNote ? (
                <p className="text-xs leading-[1.4] text-accent">{profileNote}</p>
              ) : (
                <p className="text-xs leading-[1.4] text-[#53645B]">
                  Email is managed by your account and cannot be edited here.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={requestSave}
              className="inline-flex w-full shrink-0 items-center justify-center rounded-lg border border-accent bg-accent px-4 py-3 text-base font-semibold leading-[1.4] text-white lg:w-fit lg:px-[18px] lg:py-2.5"
            >
              Save changes
            </button>
          </div>
        </form>
      ) : null}

      {showSecurity || showNotifications ? (
        <div
          className={`grid gap-5 ${showSecurity && showNotifications ? "xl:grid-cols-2" : ""}`}
        >
          {showSecurity ? (
            <section id="security-controls" className={`${panelClass} scroll-mt-24`}>
              <div className="flex flex-col items-start gap-1 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-3">
                <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-snug text-[#14271F]">
                  Security controls
                </h2>
                <PanelLink onClick={() => selectView("security", "security-controls")}>
                  Security center →
                </PanelLink>
              </div>
              <DetailLine
                label="Password last changed"
                value={`${passwordChanged} · Change →`}
                onClick={() => setDialog({ type: "password" })}
              />
              <div className="h-px bg-[#D9E5DD]" />
              <p className="text-[13px] leading-[1.4] text-[#53645B]">
                FMI will never ask for your password in a message.
              </p>
            </section>
          ) : null}

          {showNotifications ? (
            <section id="notification-preferences" className={`${panelClass} scroll-mt-24`}>
              <div className="flex flex-col items-start gap-1 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-3">
                <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-snug text-[#14271F]">
                  Notification preferences
                </h2>
                <PanelLink onClick={savePreferences}>Save preferences →</PanelLink>
              </div>
              {notificationFlags.length === 0 ? (
                <p className="text-sm leading-[1.4] text-[#53645B]">
                  {notificationsQuery.isLoading
                    ? "Loading notification preferences…"
                    : "Notification preferences were not returned as individual settings."}
                </p>
              ) : null}
              {notificationFlags.map((item) => {
                const enabled = Boolean(preferences[item.id] ?? item.enabled);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:gap-[15px]"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="text-[15px] font-semibold leading-[1.35] text-[#14271F]">
                        {item.title}
                      </p>
                      <p className="text-[13px] leading-[1.4] text-[#53645B]">
                        Account notification
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={item.title}
                      onClick={() => {
                        setPreferences((current) => ({
                          ...current,
                          [item.id]: !(current[item.id] ?? item.enabled),
                        }));
                        setPreferenceNote("");
                      }}
                      className="shrink-0"
                    >
                      <img
                        src={enabled ? "/workspace/toggle-on.svg" : "/workspace/toggle-off.svg"}
                        alt=""
                        width={36}
                        height={21}
                      />
                    </button>
                  </div>
                );
              })}
              {preferenceNote ? (
                <p className="text-xs leading-[1.4] text-accent">{preferenceNote}</p>
              ) : null}
            </section>
          ) : null}
        </div>
      ) : null}

      {showSessions || showDocuments ? (
        <div
          className={`grid gap-5 ${showSessions && showDocuments ? "xl:grid-cols-[minmax(0,1fr)_510px]" : ""}`}
        >
          {showSessions ? (
            <section id="active-sessions" className={`${panelClass} scroll-mt-24`}>
              <div className="flex flex-col items-start gap-1 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-3">
                <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-snug text-[#14271F]">
                  Active sessions
                </h2>
                <PanelLink onClick={requestSignOutOthers}>Sign out all other sessions</PanelLink>
              </div>
              {sessionsQuery.isLoading && sessions.length === 0 ? (
                <p className="text-sm text-[#53645B]">Loading sessions…</p>
              ) : null}
              {sessions.length === 0 && !sessionsQuery.isLoading ? (
                <p className="text-sm text-[#53645B]">No sessions returned.</p>
              ) : null}
              <div className="flex flex-col gap-3 lg:hidden">
                {sessions.map((session) => (
                  <article
                    key={session.id}
                    className="flex flex-col rounded-lg bg-[#F4F9F6] px-3 py-4 text-sm leading-[1.8] text-[#14271F]"
                  >
                    <p className="text-[#718078]">Device</p>
                    <p className="text-base font-semibold leading-[1.8]">{session.device}</p>
                    {session.detail ? (
                      <p className="text-base font-semibold leading-[1.8]">{session.detail}</p>
                    ) : null}
                    <p>Location: {session.location}</p>
                    <p>Last active: {session.lastActive}</p>
                    <p>
                      Action:{" "}
                      {session.current ? (
                        "Current session"
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDialog({ type: "revoke", sessionId: session.id })}
                          className="text-[#14271F]"
                        >
                          Revoke →
                        </button>
                      )}
                    </p>
                  </article>
                ))}
              </div>
              <div className="hidden overflow-x-auto lg:block">
                <div className="min-w-[640px]">
                  <div className="grid grid-cols-[230px_minmax(140px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)] gap-3 rounded-md bg-[#F4F9F6] px-3 py-3 text-xs font-medium text-[#718078]">
                    <p>Device</p>
                    <p>Location</p>
                    <p>Last active</p>
                    <p>Action</p>
                  </div>
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="grid grid-cols-[230px_minmax(140px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)] items-center gap-3 border-b border-[#D9E5DD] px-3 py-3.5"
                    >
                      <p className="text-sm font-semibold leading-[1.35] text-[#14271F]">
                        {session.device}
                        {session.detail ? (
                          <>
                            <br />
                            {session.detail}
                          </>
                        ) : null}
                      </p>
                      <p className="text-sm leading-[1.35] text-[#14271F]">{session.location}</p>
                      <p className="text-sm leading-[1.35] text-[#14271F]">{session.lastActive}</p>
                      {session.current ? (
                        <p className="text-sm leading-[1.35] text-[#14271F]">Current session</p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDialog({ type: "revoke", sessionId: session.id })}
                          className="w-fit text-sm leading-[1.35] text-[#14271F]"
                        >
                          Revoke →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {showDocuments ? (
            <section
              id="compliance-documents"
              className={`${panelClass} scroll-mt-24 ${showSessions ? "xl:w-[510px]" : ""}`}
            >
              <div className="flex flex-col items-start gap-1 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-3">
                <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-snug text-[#14271F]">
                  Documents
                </h2>
                <PanelLink onClick={() => selectView("documents", "compliance-documents")}>
                  View vault →
                </PanelLink>
              </div>
              <form
                className="flex flex-col gap-2 sm:flex-row sm:items-end"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const input = form.elements.namedItem("file");
                  const file =
                    input instanceof HTMLInputElement ? input.files?.[0] : undefined;
                  if (!file) return;
                  uploadDocument.mutate(
                    { file, title: uploadTitle || file.name },
                    {
                      onSuccess: () => {
                        setUploadTitle("");
                        form.reset();
                      },
                    },
                  );
                }}
              >
                <label className="flex flex-1 flex-col gap-1 text-sm text-[#53645B]">
                  Document title
                  <input
                    value={uploadTitle}
                    onChange={(event) => setUploadTitle(event.target.value)}
                    className="rounded-lg border border-[#D9E5DD] px-3 py-2 text-[#14271F]"
                  />
                </label>
                <input name="file" type="file" className="text-sm text-[#53645B]" />
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white"
                >
                  Upload
                </button>
              </form>
              {documents.length === 0 ? (
                <p className="text-sm text-[#53645B]">No documents on file.</p>
              ) : null}
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center gap-3 border-b border-[#D9E5DD] py-[11px]"
                >
                  <img
                    src="/workspace/icon-file-text.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold leading-[1.35] text-[#14271F]">
                      {document.title}
                    </p>
                    <p className="text-xs leading-[1.35] text-[#718078]">{document.meta}</p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-[#8A3E36]"
                    onClick={() => deleteDocument.mutate(document.id)}
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    aria-label={`Download ${document.title}`}
                    onClick={() => downloadDocument(document)}
                    className="shrink-0"
                  >
                    <img src="/workspace/icon-download.svg" alt="" width={17} height={17} />
                  </button>
                </div>
              ))}
            </section>
          ) : null}
        </div>
      ) : null}

      {dialog?.type === "unchanged-profile" ? (
        <FeedbackDialog
          eyebrow="ACCOUNT / PROFILE"
          title="No profile changes"
          onClose={() => setDialog(null)}
          showClose
          actions={<DialogButton onClick={() => setDialog(null)}>Close</DialogButton>}
        >
          <Note>Legal name, email and mobile already match what is saved.</Note>
        </FeedbackDialog>
      ) : null}

      {dialog?.type === "save-profile" ? (
        <FeedbackDialog
          eyebrow="ACCOUNT / PROFILE"
          title="Save profile changes"
          onClose={() => setDialog(null)}
          showClose
          actions={
            <>
              <DialogButton onClick={() => setDialog(null)}>Cancel</DialogButton>
              <DialogButton tone="primary" onClick={commitProfile}>
                Save changes
              </DialogButton>
            </>
          }
        >
          {(
            [
              ["Legal first name", saved.firstName, trimmed(draft).firstName],
              ["Legal last name", saved.lastName, trimmed(draft).lastName],
              ["Email address", saved.email, trimmed(draft).email],
              ["Mobile number", saved.mobile, trimmed(draft).mobile],
            ] as const
          )
            .filter(([, from, to]) => from !== to)
            .map(([label, from, to]) => (
              <div
                key={label}
                className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-5"
              >
                <p className="text-[15px] leading-[1.4] text-[#53645B]">{label}</p>
                <p className="min-w-0 break-words text-[15px] font-semibold text-[#14271F] sm:text-right">
                  {from} → {to}
                </p>
              </div>
            ))}
          <Note>Contact details are saved to your PrivCap account.</Note>
        </FeedbackDialog>
      ) : null}

      {dialog?.type === "password" ? (
        <PasswordDialog
          onClose={() => setDialog(null)}
          onSaved={(stamp) => setPasswordChanged(stamp)}
          onSubmit={(input) => passwordMutation.mutateAsync(input).then(() => undefined)}
        />
      ) : null}

      {dialog?.type === "revoke" && revokeTarget ? (
        <FeedbackDialog
          eyebrow="SECURITY / SESSIONS"
          title="Revoke this session"
          onClose={() => setDialog(null)}
          showClose
          actions={
            <>
              <DialogButton onClick={() => setDialog(null)}>Keep session</DialogButton>
              <DialogButton tone="primary" onClick={() => revoke(revokeTarget.id)}>
                Revoke session
              </DialogButton>
            </>
          }
        >
          <Note>
            {revokeTarget.device} in {revokeTarget.location} was last active{" "}
            {revokeTarget.lastActive}. Revoking ends that signed-in session.
          </Note>
        </FeedbackDialog>
      ) : null}

      {dialog?.type === "sign-out-others" ? (
        <FeedbackDialog
          eyebrow="SECURITY / SESSIONS"
          title="Sign out other sessions"
          onClose={() => setDialog(null)}
          showClose
          actions={
            <>
              <DialogButton onClick={() => setDialog(null)}>Cancel</DialogButton>
              <DialogButton
                tone="primary"
                onClick={async () => {
                  await Promise.all(
                    otherSessions().map((session) =>
                      revokeMutation.mutateAsync(session.id),
                    ),
                  );
                  setDialog(null);
                }}
              >
                Sign out others
              </DialogButton>
            </>
          }
        >
          <Note>
            {otherSessions()
              .map((session) => session.device)
              .join(", ")}{" "}
            will be signed out. Your current session stays signed in.
          </Note>
        </FeedbackDialog>
      ) : null}

      {dialog?.type === "no-other-sessions" ? (
        <FeedbackDialog
          eyebrow="SECURITY / SESSIONS"
          title="No other sessions"
          onClose={() => setDialog(null)}
          showClose
          actions={<DialogButton onClick={() => setDialog(null)}>Close</DialogButton>}
        >
          <Note>This is the only active session.</Note>
        </FeedbackDialog>
      ) : null}
    </div>
  );
}
