/**
 * Base URL for server-side fetch to Django.
 * Prefer DJANGO_INTERNAL_URL (http://127.0.0.1:8000 on prod).
 * Never use public https://domain from the Next server — hairpin/timeouts.
 */
export function getDjangoServerUrl() {
  const internal = (process.env.DJANGO_INTERNAL_URL || "").trim().replace(/\/$/, "");
  if (internal) return internal;

  const pub = (process.env.NEXT_PUBLIC_DJANGO_URL || "").trim().replace(/\/$/, "");
  if (pub && /localhost|127\.0\.0\.1/i.test(pub)) return pub;

  return "http://127.0.0.1:8000";
}
