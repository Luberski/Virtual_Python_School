import React from "react";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Input from "../components/Input";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations();

  return (
    <>
      <div className="absolute w-full h-full bg-white">
        <nav className="w-full mx-auto bg-white">
          <div className="container flex items-center justify-between h-16 px-6 mx-auto lg:items-stretch">
            <div className="flex items-center h-full">
              <div className="flex items-center mr-10">
                <Link href="/" passHref={true}>
                  <a className="hidden ml-3 text-base font-bold leading-tight tracking-normal text-gray-900 lg:block no-underline hover:no-underline">
                    Virtual Python School
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="container flex flex-col justify-center px-6 pb-4 mx-auto my-6 lg:my-12 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-5xl font-bold text-center text-gray-900">
              {t("Auth.welcome-back")}
            </h1>
          </div>
        </div>
        <div className="container px-6 mx-auto">
          <div className="flex flex-col space-y-8 items-center justify-center">
            <Input type="email" placeholder={t("Auth.email")} />
            <Input type="password" placeholder={t("Auth.password")} />
            <Button primary className="w-36">
              {t("Auth.login")}
            </Button>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      i18n: Object.assign({}, await import(`../../i18n/${locale}.json`)),
    },
  };
}
