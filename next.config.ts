import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return ['/Eesher_Janda_Resume.pdf', '/resume-version.json'].map((source) => ({
      source,
      headers: [{ key: 'Cache-Control', value: 'no-store' }],
    }));
  },
  async redirects() {
    return ['/resume', '/cv'].map((source) => ({
      source,
      destination: '/Eesher_Janda_Resume.pdf',
      permanent: false,
    }));
  },
};

export default nextConfig;
