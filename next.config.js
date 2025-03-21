/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  async redirects() {
    return [
      {
        source: '/zh',
        destination: '/',
        permanent: true, // 使用 301 永久重定向
      },
      {
        source: '/zh/:path*',
        destination: '/:path*',
        permanent: true, // 处理子路径
      },
    ];
  },
};

module.exports = nextConfig;
