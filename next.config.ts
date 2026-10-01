import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/catalog/equipment/:path*", destination: "/equipment/:path*", permanent: true }];
  },
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hixvazsvmjcxkytxpucg.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
