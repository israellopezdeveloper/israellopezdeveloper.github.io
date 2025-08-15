import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@chakra-ui/react',
    '@chakra-ui/system',
    '@chakra-ui/icons',
  ],
  output: 'export',
  images: { unoptimized: true },
  distDir: 'dist',
};

export default nextConfig;
