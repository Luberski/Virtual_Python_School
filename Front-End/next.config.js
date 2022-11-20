module.exports = {
  i18n: {
    locales: ['en', 'pl'],
    defaultLocale: 'pl',
    localeDetection: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:slug*',
        destination: 'http://localhost:5000/api/:slug*',
      },
    ];
  },
  swcMinify: true,
};
