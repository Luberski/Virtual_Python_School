import React from "react";
import Image from "next/image";
import Footer from "../components/Footer";
import Link from "next/link";
import ButtonLink from "../components/ButtonLink";
import { useTranslations } from "next-intl";
import { useAppSelector } from "../hooks";
import { selectIsLogged, selectAuthUser } from "../features/auth/authSlice";
import NavBar from "../components/NavBar";

export default function IndexPage() {
  const t = useTranslations();

  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);

  return (
    <>
      <div className="absolute w-full h-full bg-gray-50">
        <NavBar user={user} isLoggedIn={isLoggedIn} />
        <div className="container flex flex-col justify-center px-6 pb-4 mx-auto my-6 lg:my-12 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-4xl font-bold text-center text-gray-900">
              {t("Home.leading")}
            </h1>
            <h2 className="text-xl text-center text-gray-900">
              {t("Home.choose-skill-level")}
            </h2>
          </div>
        </div>
        <div className="container px-6 mx-auto">
          <div className="flex justify-center w-full h-full space-x-12">
            <div className="flex flex-col p-8 bg-emerald-200 shadow-md hover:shadow-xl hover:shadow-emerald-400/50 transition duration-500 ease-in-out hover:scale-110 shadow-emerald-200/50 rounded-xl">
              <h3 className="text-xl font-bold">{t("Home.beginners")}</h3>
              <p className="text-gray-700 max-w-xs h-8">
                {t("Home.beginners-info")}
              </p>
              <Link href="/courses" passHref={true}>
                <ButtonLink className="mt-16 w-42">
                  {t("Home.learn-more")}
                </ButtonLink>
              </Link>
            </div>
            <div className="flex flex-col p-8 bg-indigo-200 shadow-md hover:shadow-xl hover:shadow-indigo-400/50 transition duration-500 ease-in-out hover:scale-110 shadow-indigo-200/50 rounded-xl ">
              <h3 className="text-xl font-bold">{t("Home.intermediate")}</h3>
              <p className="text-gray-700 max-w-xs h-8">
                {t("Home.intermediate-info")}
              </p>
              <Link href="/courses" passHref={true}>
                <ButtonLink className="mt-16 w-42">
                  {t("Home.learn-more")}
                </ButtonLink>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center my-16">
          <Image
            src="/undraw_online_test_gba7.png"
            alt="online_test"
            width="601"
            height="278"
          />
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
