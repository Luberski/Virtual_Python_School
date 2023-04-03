import '../src/styles/index.css';
import * as NextImage from 'next/image';
import { NextIntlProvider } from 'next-intl';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { reactIntl } from './reactIntl.js';

const OriginalNextImage = NextImage.default;

// eslint-disable-next-line no-import-assign
Object.defineProperty(NextImage, 'default', {
  configurable: true,
  value: (props) => <OriginalNextImage {...props} unoptimized />,
});

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  previewTabs: {
    'storybook/docs/panel': { index: -1 },
  },
  nextRouter: {
    Provider: RouterContext.Provider,
  },
  reactIntl,
  backgrounds: {
    default: 'white',
    values: [
      {
        name: 'white',
        value: '#ffffff',
      },
      {
        name: 'light',
        value: '#fafafa',
      },
      {
        name: 'dark',
        value: '#171717',
      },
    ],
  },
};

const withI18n = (storyFn) => (
  <NextIntlProvider
    locale={reactIntl.defaultLocale}
    messages={reactIntl.messages}>
    {storyFn()}
  </NextIntlProvider>
);

export const decorators = [withI18n];
