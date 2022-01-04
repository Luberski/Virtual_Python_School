import React from "react";
import Footer from "../components/Footer";
import Input from "../components/Input";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import ButtonInput from "../components/ButtonInput";
import NavBar from "../components/NavBar";

export default function RegisterPage() {
  const t = useTranslations();
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => console.log(data);

  return (
    <>
      <div className="absolute w-full h-full">
        <NavBar />
        <div className="container flex flex-col items-center justify-center px-6 pb-4 mx-auto my-6">
          <div>
            <h1 className="text-center">{t("Auth.create-new-account")}</h1>
          </div>
        </div>
        <div className="container px-6 mx-auto">
          <form
            className="flex flex-col items-center justify-center space-y-8"
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
              label="firstName"
              type="text"
              placeholder={t("Auth.name")}
              register={register}
              required
            />
            <Input
              label="lastName"
              type="text"
              placeholder={t("Auth.last-name")}
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
            <Input
              label="confirmPassword"
              type="password"
              placeholder={t("Auth.confirm-password")}
              register={register}
              required
            />
            <ButtonInput
              className="btn-primary w-36"
              type="submit"
              value={t("Auth.register")}
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
