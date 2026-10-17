import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // R3F's canvas root doesn't survive StrictMode's simulated unmount in dev
  reactStrictMode: false,
  devIndicators: false,
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;
