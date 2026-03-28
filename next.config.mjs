/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://3.27.1.180:7000/:path*',
      },
    ]
  },
};

export default nextConfig;
