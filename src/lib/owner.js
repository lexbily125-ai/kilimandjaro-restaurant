// Owner / admin email registry for Kilimandjaro staff access.
// The owner account is auto-elevated to full admin on login.
export const OWNER_EMAIL = "lexbily125@gmail.com";
export const ADMIN_EMAILS = ["lexbily125@gmail.com", "isyoumaba70@gmail.com"];

export const isOwner = (email) =>
  (email || "").trim().toLowerCase() === OWNER_EMAIL;