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
  // /cdn/* → 资源站；视频同源加载，避免 CDN CORS/缓存导致 WebGL 读帧失败
  async rewrites() {
    return [
      {
        source: "/cdn/:path*",
        destination: "https://assert.vrfan.icu/:path*",
      },
    ];
  },
};

export default nextConfig;
