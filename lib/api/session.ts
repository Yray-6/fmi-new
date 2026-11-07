import type { ApiUserProfile, SessionUser } from "./types";

export function toSessionUser(profile: ApiUserProfile): SessionUser {
  const firstName = profile.first_name || "";
  const lastName = profile.last_name || "";
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
    profile.email.charAt(0).toUpperCase();

  return {
    id: profile.id,
    email: profile.email,
    firstName,
    lastName,
    fullName: profile.full_name || `${firstName} ${lastName}`.trim() || profile.email,
    investorTypeDisplay: profile.investor_type_display || "Investor",
    initials,
  };
}
