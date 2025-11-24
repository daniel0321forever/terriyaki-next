import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: false,
  swcMinify: true,
  compress: true,
};

export default nextConfig;
