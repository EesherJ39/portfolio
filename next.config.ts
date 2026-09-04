import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return ['/Eesher_Janda_Resume.pdf', '/resume-version.json'].map((source) => ({
      source,
      headers: [{ key: 'Cache-Control', value: 'no-store' }],
    }));
  },
};

export default nextConfig;
