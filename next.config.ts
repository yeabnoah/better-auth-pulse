import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  webpack: (config, { isServer }) => {
    // Handle path mapping for published packages
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": require("path").resolve(__dirname, "."),
    };

    // Exclude auth.ts from build
    config.module.rules.push({
      test: /auth\.ts$/,
      use: "ignore-loader",
    });

    return config;
  },
};

export default nextConfig;
