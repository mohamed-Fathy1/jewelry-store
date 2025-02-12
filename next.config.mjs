// import { withNextVideo } from "next-video/process";
/**
 * @type {import('next').NextConfig}
 *
 */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**", // Match any hostname
        pathname: "**", // Match any path
      },
      {
        protocol: "https",
        hostname: "**", // Match any hostname
        pathname: "**", // Match any path
      },
      {
        protocol: "https",
        hostname: "https://atozaccessories.s3.us-east-1.amazonaws.com",
        pathname: "/**", // Allows all paths in this bucket
        port: "", // Leave empty for default HTTPS port
      },
    ],
    domains: ["atozaccessories.s3.us-east-1.amazonaws.com"],
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
