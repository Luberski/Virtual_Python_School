import React from "react";
import Footer from "../components/Footer";
import Input from "../components/Input";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import ButtonInput from "../components/ButtonInput";
import { useAppDispatch } from "../hooks";
import { loginUser } from "../features/auth/authSlice";
import NavBar from "../components/NavBar";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    const { username, password } = data;

    try {
      await dispatch(loginUser({ username, password })).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="absolute w-full h-ful">
        <NavBar />
        <div className="container flex flex-col justify-center px-6 pb-4 mx-auto my-6 lg:my-12 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-center">{t("Auth.welcome-back")}</h1>
          </div>
        </div>
        <div className="container px-6 mx-auto">
          <form
            className="flex flex-col space-y-8 items-center justify-center"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Input
              label="username"
              type="username"
              placeholder={t("Auth.username")}
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
              className="btn-primary w-36"
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
