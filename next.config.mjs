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
  async rewrites() {
    const djangoBase =
      process.env.NEXT_PUBLIC_DJANGO_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${djangoBase}/api/:path*`,
      },
    ];
  },
  images: {
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
