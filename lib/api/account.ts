import {
  bffDelete,
  bffDownload,
  bffGet,
  bffPatch,
  bffPost,
  logoutIfUnauthenticated,
} from "./client";
import { asList, asRecord } from "./pagination";
import type { ApiUserProfile } from "./types";

export interface AccountProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
  country: string;
  address: string;
  investorType: string;
  investorTypeDisplay: string;
  riskTolerance: string;
  riskToleranceDisplay: string;
  isVerified: boolean;
  memberSince: string;
}

export interface AccountSession {
  id: string;
  device: string;
  detail?: string;
  location: string;
  lastActive: string;
  current?: boolean;
}

export interface AccountDocument {
  id: string;
  title: string;
  meta: string;
}

export interface AccountActivity {
  id: string;
  title: string;
  meta: string;
}

export interface NotificationFlag {
  id: string;
  title: string;
  enabled: boolean;
}

const PROFILE_BOOLEANS = new Set([
  "is_verified",
  "is_active",
  "is_staff",
  "is_email_verified",
]);

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function mapProfile(data: ApiUserProfile): AccountProfile {
  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name || "",
    lastName: data.last_name || "",
    mobile: data.phone_number || "",
    country: data.country || "",
    address: data.address || "",
    investorType: data.investor_type || "",
    investorTypeDisplay: data.investor_type_display || "",
    riskTolerance: data.risk_tolerance || "",
    riskToleranceDisplay: data.risk_tolerance_display || "",
    isVerified: Boolean(data.is_verified),
    memberSince: data.member_since || "",
  };
}

export function fetchAccountProfile() {
  return bffGet<ApiUserProfile>("/api/bff/accounts/account/profile").then(mapProfile);
}

export function updateAccountProfile(profile: AccountProfile) {
  return bffPatch<ApiUserProfile>("/api/bff/accounts/account/profile", {
    first_name: profile.firstName,
    last_name: profile.lastName,
    phone_number: profile.mobile,
    country: profile.country,
    address: profile.address,
    investor_type: profile.investorType || undefined,
    risk_tolerance: profile.riskTolerance || undefined,
  }).then(mapProfile);
}

export function changePassword(input: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  return bffPost<{ ok?: boolean; message?: string }>(
    "/api/bff/accounts/account/change_password",
    {
      old_password: input.oldPassword,
      new_password: input.newPassword,
      new_password_confirm: input.confirmPassword,
    },
  );
}

function mapSession(item: Record<string, unknown>, index: number): AccountSession {
  const id = item.id ?? item.session_id ?? item.pk ?? index;
  return {
    id: String(id),
    device: text(item.device) || text(item.user_agent) || text(item.browser) || "Session",
    detail: text(item.detail) || undefined,
    location: text(item.location) || text(item.ip_address) || text(item.last_login_ip) || "Unknown",
    lastActive:
      text(item.last_active) ||
      text(item.last_activity) ||
      text(item.last_seen) ||
      text(item.updated_at) ||
      "Unknown",
    current: Boolean(item.current || item.is_current || item.is_current_session),
  };
}

export async function fetchSessions() {
  const payload = await bffGet<unknown>("/api/bff/accounts/account/sessions");
  return asList(payload).map(mapSession);
}

export function revokeSession(id: string) {
  const query = new URLSearchParams({ session_id: id, id });
  return bffDelete(`/api/bff/accounts/account/revoke_session?${query.toString()}`);
}

function mapDocument(item: Record<string, unknown>, index: number): AccountDocument {
  const id = item.id ?? item.document_id ?? index;
  const uploaded = text(item.uploaded_at) || text(item.created_at);
  return {
    id: String(id),
    title: text(item.title) || text(item.name) || text(item.filename) || "Document",
    meta: text(item.document_type_display) || text(item.status) || uploaded || "On file",
  };
}

export async function fetchAccountDocuments() {
  const payload = await bffGet<unknown>("/api/bff/accounts/account/documents");
  return asList(payload).map(mapDocument);
}

export function uploadAccountDocument(file: File, title: string) {
  const form = new FormData();
  form.set("title", title || file.name);
  form.set("file", file);
  form.set("document", file);
  return fetch("/api/bff/accounts/account/documents", {
    method: "POST",
    credentials: "same-origin",
    body: form,
  }).then(async (response) => {
    if (!response.ok) {
      let message = "Could not upload the document";
      try {
        const data = (await response.json()) as { message?: string };
        message = data.message || message;
      } catch {
        // keep default
      }
      logoutIfUnauthenticated(response.status);
      throw new Error(message);
    }
  });
}

export function downloadAccountDocument(id: string, filename: string) {
  const query = new URLSearchParams({ document_id: id, id });
  return bffDownload(
    `/api/bff/accounts/account/document_download?${query.toString()}`,
    filename,
  );
}

export function deleteAccountDocument(id: string) {
  const query = new URLSearchParams({ document_id: id, id });
  return bffDelete(`/api/bff/accounts/account/delete_document?${query.toString()}`);
}

export async function fetchNotificationFlags(): Promise<NotificationFlag[]> {
  const payload = await bffGet<unknown>(
    "/api/bff/accounts/account/notification_preferences",
  );
  const record = asRecord(payload);
  if (!record) return [];
  const nested = asRecord(record.preferences) || asRecord(record.notification_preferences);
  const source = nested || record;
  return Object.entries(source)
    .filter(([key, value]) => typeof value === "boolean" && !PROFILE_BOOLEANS.has(key))
    .map(([key, value]) => ({
      id: key,
      title: key.replaceAll("_", " "),
      enabled: Boolean(value),
    }));
}

export function updateNotificationFlags(flags: NotificationFlag[]) {
  const body = Object.fromEntries(flags.map((flag) => [flag.id, flag.enabled]));
  return bffPatch("/api/bff/accounts/account/notification_preferences", body);
}

function mapActivity(item: Record<string, unknown>, index: number): AccountActivity {
  return {
    id: String(item.id ?? index),
    title:
      text(item.description) ||
      text(item.action) ||
      text(item.title) ||
      text(item.activity) ||
      "Account activity",
    meta: text(item.created_at) || text(item.timestamp) || text(item.date),
  };
}

export async function fetchAccountActivity() {
  const payload = await bffGet<unknown>("/api/bff/accounts/account/activity");
  const list = asList(payload);
  if (list.length > 0) return list.map(mapActivity);
  return [];
}
