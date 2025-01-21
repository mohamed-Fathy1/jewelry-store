// import { withNextVideo } from "next-video/process";
/**
 * @type {import('next').NextConfig}
 *
 */
const nextConfig = {
  images: { unoptimized: true },
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
