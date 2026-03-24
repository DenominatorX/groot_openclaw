/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sub-app at /beach on DenominatorX.com
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.zillowstatic.com' },
      { protocol: 'https', hostname: '**.rdcpix.com' },
      { protocol: 'https', hostname: '**.ssl-images-amazon.com' },
    ],
  },
};

module.exports = nextConfig;
