/** @type {import('next').NextConfig} */
function mediaRemotePatternsFromPublicUrl() {
  const base = process.env.NEXT_PUBLIC_DJANGO_URL;
  if (!base) return [];
  try {
    const u = new URL(base);
    const protocol = u.protocol === "https:" ? "https" : "http";
    const entry = {
      protocol,
      hostname: u.hostname,
      pathname: "/media/**",
    };
    if (u.port) entry.port = u.port;
    return [entry];
  } catch {
    return [];
  }
}

const nextConfig = {
  transpilePackages: ["three", "@react-three/fiber"],
  // Safari/iOS sometimes never requests /_next/static/css/* (preload/cache bug
  // or content blockers). Inlining puts Tailwind in the HTML so first paint works.
  experimental: {
    inlineCss: true,
  },
  async redirects() {
    return [
      { source: "/services/web", destination: "/services/tilda", permanent: true },
      { source: "/services/crm", destination: "/services/django", permanent: true },
      { source: "/services/ui-ux", destination: "/services/tilda", permanent: true },
      { source: "/services/brand", destination: "/services/marketing", permanent: true },
      { source: "/case/:slug", destination: "/portfolio/:slug", permanent: true },
    ];
  },
  async rewrites() {
    // Важно: для rewrite на сервере всегда 127.0.0.1:8000 (Gunicorn),
    // а НЕ публичный https://домен — иначе Next Image упирается в hairpin/таймаут
    // и картинки «есть в API», но не рисуются.
    const djangoInternal = (
      process.env.DJANGO_INTERNAL_URL ||
      "http://127.0.0.1:8000"
    ).replace(/\/$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${djangoInternal}/api/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${djangoInternal}/media/:path*`,
      },
    ];
  },
  images: {
    // Next 16 требует явный список, если передаёте quality≠75
    qualities: [75, 90, 92, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      ...mediaRemotePatternsFromPublicUrl(),
    ],
  },
};

export default nextConfig;
