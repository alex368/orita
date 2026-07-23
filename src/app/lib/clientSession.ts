export const CLIENT_SESSION_COOKIE = "benintours_client_session";

export function readClientSessionToken(): string | null {
  if (typeof document === "undefined") return null;

  const prefix = `${CLIENT_SESSION_COOKIE}=`;
  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length) ?? null;
}

export function writeClientSessionToken(token: string) {
  document.cookie = `${CLIENT_SESSION_COOKIE}=${encodeURIComponent(token)}; Max-Age=${60 * 60 * 24 * 30}; Path=/; SameSite=Lax`;
}

export function clearClientSessionToken() {
  document.cookie = `${CLIENT_SESSION_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export function hasClientSession() {
  return Boolean(readClientSessionToken());
}

export function clientLoginPath(returnTo: string) {
  return `/mon-espace?redirect=${encodeURIComponent(returnTo)}`;
}

export function safeClientRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/mon-espace";
  return value;
}
