import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Prevent Cloudflare type bindings from blocking Vercel builds
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["cloudflare:workers"],
};

export default nextConfig;
