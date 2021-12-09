module.exports = {
  i18n: {
    locales: ["en", "pl"],
    defaultLocale: "pl",
  },
  async rewrites() {
    return [
      {
        source: "/api/:slug*",
        destination: "http://localhost:5000/api/:slug*",
      },
    ];
  },
  images: {
    domains: ["cdn.cloudflare.steamstatic.com"],
  },
};
