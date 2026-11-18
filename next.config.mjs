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
    const djangoBase = (
      process.env.NEXT_PUBLIC_DJANGO_URL || "http://127.0.0.1:8000"
    )
      .replace("://localhost:", "://127.0.0.1:")
      .replace(/:\/\/localhost$/, "://127.0.0.1");
    return [
      {
        source: "/api/:path*",
        destination: `${djangoBase}/api/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${djangoBase}/media/:path*`,
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
