import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      rules: {
        'scss': {
            loaders: [
              'sass-loader',
            ],
        }
      }
    }
  }
};

export default nextConfig;
