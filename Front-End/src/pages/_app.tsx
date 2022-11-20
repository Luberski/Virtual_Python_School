import Head from 'next/head';
import type { AppProps } from 'next/app';
import '@app/styles/index.css';
import type { AbstractIntlMessages } from 'next-intl';
import { NextIntlProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import { wrapper } from '@app/store';

function MyApp({
  Component,
  pageProps,
}: AppProps & {
  Component: {
    theme: string;
  };
  pageProps: {
    i18n: AbstractIntlMessages;
    now: Date;
    timeZone: string;
  };
}) {
  return (
    <>
      <Head>
        <title>Virtual Python School</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ThemeProvider
        forcedTheme={Component.theme || undefined}
        attribute="class">
        <NextIntlProvider
          messages={pageProps.i18n}
          now={new Date(pageProps.now)}
          timeZone="Europe/Warsaw">
          <Component {...pageProps} />
        </NextIntlProvider>
      </ThemeProvider>
    </>
  );
}

export default wrapper.withRedux(MyApp);
