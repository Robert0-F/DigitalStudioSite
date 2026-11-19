/**
 * Proxy for admin site-settings.
 * Next.js rewrites often corrupt multipart PUT bodies; this forwards the raw
 * request (including files) to Django with cookies intact.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function djangoBase() {
  return (
    process.env.DJANGO_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_DJANGO_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");
}

async function proxyToDjango(request) {
  const target = `${djangoBase()}/api/admin/site-settings`;
  const headers = new Headers();

  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("Cookie", cookie);

  const method = request.method.toUpperCase();
  const init = { method, headers, cache: "no-store" };

  if (method !== "GET" && method !== "HEAD") {
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    init.body = Buffer.from(await request.arrayBuffer());
  }

  let upstream;
  try {
    upstream = await fetch(target, init);
  } catch (err) {
    const message =
      err?.cause?.code === "ECONNREFUSED" || /fetch failed/i.test(String(err?.message || ""))
        ? "Django не отвечает. Запустите backend (python manage.py runserver) на порту 8000."
        : err?.message || "Не удалось связаться с Django";
    return Response.json({ error: message }, { status: 502 });
  }

  const body = await upstream.arrayBuffer();
  const outHeaders = new Headers();
  const ct = upstream.headers.get("content-type");
  if (ct) outHeaders.set("Content-Type", ct);

  return new Response(body, { status: upstream.status, headers: outHeaders });
}

export async function GET(request) {
  return proxyToDjango(request);
}

export async function PUT(request) {
  return proxyToDjango(request);
}
