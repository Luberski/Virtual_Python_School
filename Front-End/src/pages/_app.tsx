import Head from "next/head";
import { AppProps } from "next/app";
import "../styles/index.css";
import { NextIntlProvider } from "next-intl";
import { wrapper } from "../store";
import Script from "next/script";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Virtual Python School</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Script strategy="beforeInteractive" src="/darkMode.js" />
      <NextIntlProvider
        messages={pageProps.i18n}
        now={new Date(pageProps.now)}
        timeZone="Europe/Warsaw"
      >
        <Component {...pageProps} />
      </NextIntlProvider>
    </>
  );
}

export default wrapper.withRedux(MyApp);
