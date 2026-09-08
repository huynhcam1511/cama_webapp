import type { CookieOptionsWithName } from "@supabase/ssr";

/** Keep a renewable Supabase session on this browser for up to 30 days. */
export const AUTH_COOKIE_OPTIONS: CookieOptionsWithName = {
  path: "/",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 30,
};
