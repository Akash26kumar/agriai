/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rewrites allow the frontend to call /backend/* and have it proxied to the
  // Node.js backend at localhost:5000, avoiding CORS issues in dev.
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "http://localhost:5000/:path*",
      },
    ];
  },
};

export default nextConfig;
