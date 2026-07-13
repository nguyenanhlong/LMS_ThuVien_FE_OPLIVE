import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/graphql',
        destination: 'http://localhost:3000/graphql',
      },
      {
        source: '/users',
        destination: 'http://localhost:3000/users',
      },
      {
        source: '/users/:path*',
        destination: 'http://localhost:3000/users/:path*',
      },
      {
        source: '/auths/:path*',
        destination: 'http://localhost:3000/auths/:path*',
      },
    ];
  },
};

export default nextConfig;
