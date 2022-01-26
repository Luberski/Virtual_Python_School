const locales = ["en", "pl"];

const messages = locales.reduce(
  (acc, lang) => ({
    ...acc,
    [lang]: require(`../i18n/${lang}.json`),
  }),
  {}
);

const formats = {}; // optional, if you have any formats

export const reactIntl = {
  defaultLocale: "en",
  locales,
  messages,
  formats,
};
