/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  webpack: (config) => {
    // WalletConnect's logger optionally requires pino-pretty; alias keeps bundler quiet
    config.resolve.alias["pino-pretty"] = false
    return config
  },
}
export default nextConfig
