import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assert.vrfan.icu",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
