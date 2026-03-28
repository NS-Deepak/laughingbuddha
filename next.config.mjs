/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow LAN access from other devices during development
  allowedDevOrigins: ['192.168.0.60'],

  // NOTE: The Python backend proxy (/pyapi/*) has been removed.
  // The TypeScript API routes in app/api/python/* have replaced it.
  // No rewrites needed anymore.

  turbopack: {
    root: './',
  },
};

export default nextConfig
