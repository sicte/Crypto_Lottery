/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Ignore broken transitive dependencies
    config.resolve.alias = {
      ...config.resolve.alias,
      '@x402/evm/upto/client': false,
      '@x402/evm/exact/client': false,
      '@x402/core/client': false,
      '@x402/svm/exact/client': false,
      '@x402/evm': false,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };

    // Exclude problematic modules from bundling
    config.externals = [
      ...(config.externals || []),
      '@coinbase/cdp-sdk',
      '@base-org/account',
      '@react-native-async-storage/async-storage',
      'pino-pretty',
    ];

    return config;
  },
};

export default nextConfig;