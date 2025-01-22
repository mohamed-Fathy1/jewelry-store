// import { withNextVideo } from "next-video/process";
/**
 * @type {import('next').NextConfig}
 *
 */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
    domains: [
      // ... your image domains
    ],
  },
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
