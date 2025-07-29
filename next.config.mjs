/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['opensea.mypinata.cloud', 'i.seadn.io'],
    unoptimized: true,
  },
}

export default nextConfig
