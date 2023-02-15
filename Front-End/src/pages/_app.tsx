import Head from 'next/head';
import type { AppProps } from 'next/app';
import '@app/styles/index.css';
import { Provider } from 'react-redux';
import type { AbstractIntlMessages } from 'next-intl';
import { NextIntlProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import type { AppStore } from '@app/store';
import { wrapper } from '@app/store';

function MyApp({
  Component,
  ...rest
}: AppProps & { Component: { theme: string } }) {
  const { store, props } = wrapper.useWrappedStore(rest) as {
    store: AppStore;
    props: {
      pageProps: {
        i18n: AbstractIntlMessages;
        now: Date;
        timeZone: string;
      };
    };
  };

  return (
    <Provider store={store}>
      <Head>
        <title>Virtual Python School</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ThemeProvider
        forcedTheme={Component.theme || undefined}
        attribute="class">
        <NextIntlProvider
          messages={props.pageProps.i18n}
          now={new Date(props.pageProps.now)}
          timeZone="Europe/Warsaw">
          <Component {...props.pageProps} />
        </NextIntlProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default MyApp;
