import React from "react";
import Footer from "../components/Footer";
import Input from "../components/Input";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import ButtonInput from "../components/ButtonInput";

export default function LoginPage() {
  const t = useTranslations();
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => console.log(data);

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
          <form
            className="flex flex-col space-y-8 items-center justify-center"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Input
              label="email"
              type="email"
              placeholder={t("Auth.email")}
              register={register}
              required
            />
            <Input
              label="password"
              type="password"
              placeholder={t("Auth.password")}
              register={register}
              required
            />
            <ButtonInput
              primary
              className="w-36"
              type="submit"
              value={t("Auth.login")}
            />
          </form>
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
