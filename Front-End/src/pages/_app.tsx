import Head from "next/head";
import { AppProps } from "next/app";
import "../styles/index.css";
import { NextIntlProvider } from "next-intl";
import { Provider } from "react-redux";
import { store } from "../store";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Virtual Python School</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Provider store={store}>
        <NextIntlProvider
          messages={pageProps.i18n}
          now={new Date(pageProps.now)}
          timeZone="Europe/Warsaw"
        >
          <Component {...pageProps} />
        </NextIntlProvider>
      </Provider>
    </>
  );
}

export default MyApp;
