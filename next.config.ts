import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      rules: {
        'scss': {
          loaders: [
            {
              loader: 'sass-loader',
              options: {
                api: 'modern',
              }
            }
          ]

        },
      }
    }
  }
};

export default nextConfig;
