const nextConfig = {
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
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
