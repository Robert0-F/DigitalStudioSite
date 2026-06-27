/** Read response body once and try to parse JSON. */
export async function parseAdminJson(res) {
  const raw = await res.text().catch(() => "");
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }
  return { data, raw };
}

export function adminErrorMessage({ data, raw }, fallback = "Request failed", status = 0) {
  if (data?.error) return String(data.error);
  if (data?.detail) return String(data.detail);
  const stripped = String(raw || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length > 0 && stripped.length < 400) return stripped;
  return status ? `${fallback} (${status})` : fallback;
}

/** @deprecated Prefer parseAdminJson + adminErrorMessage */
export async function readAdminApiError(res, fallback = "Request failed") {
  const { data, raw } = await parseAdminJson(res);
  return adminErrorMessage({ data, raw }, fallback, res.status);
}
