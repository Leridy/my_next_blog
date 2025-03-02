import { config } from 'dotenv';

config();

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' https://www.googletagmanager.com 'unsafe-inline'; connect-src 'self' https://www.google-analytics.com;`,
          },
        ],
      },
    ];
  },
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
