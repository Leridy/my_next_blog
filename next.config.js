import { config } from 'dotenv';

config();

const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  /* config options here */
  experimental: {
    turbo: {
      rules: {
        scss: {
          loaders: [
            {
              loader: 'sass-loader',
              options: {
                api: 'modern',
              },
            },
          ],
        },
      },
    },
  },
};

export default nextConfig;
