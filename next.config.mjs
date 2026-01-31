/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "your-domain.com",
      },
      {
        protocol: "https",
        hostname: "newsapi.org",
      },
      {
        protocol: "https",
        hostname: "readwrite.com",
      },
    ],
  },
};

export default nextConfig;
