/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/_not-found',
        destination: '/404',
        permanent: false,
      },
      {
        source: '/_not-found/:path*',
        destination: '/404',
        permanent: false,
      },
    ]
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'pino-pretty': false, // optional dev logger, not needed in prod bundle
    };
    
    config.externals = config.externals || [];
    if (config.isServer) {
      config.externals.push({
        'wagmi': 'commonjs wagmi',
        'viem': 'commonjs viem',
        '@wagmi/core': 'commonjs @wagmi/core',
      });
    }
    
    return config;
  },
}

export default nextConfig
