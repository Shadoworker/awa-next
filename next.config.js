/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: [],
    },
    transpilePackages: [
        'antd'
      ],
}

module.exports = nextConfig
