// Customer display name after the first/last -> fullName merge.
//
// Address-book records now store a single `fullName`. Historical Order snapshots
// were intentionally NOT migrated, so they may still carry `firstName`/`lastName`.
// Use this everywhere a customer name is shown so both shapes render cleanly.
interface NameParts {
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export const customerName = (info?: NameParts | null): string => {
  if (!info) return "—";
  const full = (info.fullName ?? "").trim();
  if (full) return full;
  const joined = [info.firstName, info.lastName]
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(" ");
  return joined || "—";
};
