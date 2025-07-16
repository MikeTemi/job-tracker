/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds (for quick deployment)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds (for quick deployment)
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig