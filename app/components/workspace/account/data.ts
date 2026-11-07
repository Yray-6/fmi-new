export type AccountView = "overview" | "security" | "documents" | "notifications";

export const accountViews: { id: AccountView; label: string }[] = [
  { id: "overview", label: "Account overview" },
  { id: "security", label: "Security" },
  { id: "documents", label: "Documents" },
  { id: "notifications", label: "Notifications" },
];

export type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
};

export function parseView(value: string | null): AccountView {
  return accountViews.some((item) => item.id === value)
    ? (value as AccountView)
    : "overview";
}

export function viewHref(view: AccountView) {
  return view === "overview" ? "/account" : `/account?view=${view}`;
}

export function sameProfile(left: Profile, right: Profile) {
  return (Object.keys(left) as (keyof Profile)[]).every(
    (key) => left[key].trim() === right[key].trim(),
  );
}

export function profileErrors(profile: Profile) {
  const errors: Partial<Record<keyof Profile, string>> = {};
  if (!/^[A-Za-z][A-Za-z .'-]{0,39}$/.test(profile.firstName.trim())) {
    errors.firstName = "Enter a legal first name.";
  }
  if (!/^[A-Za-z][A-Za-z .'-]{0,39}$/.test(profile.lastName.trim())) {
    errors.lastName = "Enter a legal last name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  const mobile = profile.mobile.trim();
  if (mobile) {
    const digits = mobile.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15 || !/^[+()\d\s.\-·]+$/.test(mobile)) {
      errors.mobile = "Enter a mobile number, including the country code.";
    }
  }
  return errors;
}

export function formatStamp(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
