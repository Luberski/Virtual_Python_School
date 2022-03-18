import React, { useState } from "react";
import Image from "next/image";
import Footer from "../components/Footer";
import { useTranslations } from "next-intl";
import { useHotkeys } from "react-hotkeys-hook";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectIsLogged, selectAuthUser } from "../features/auth/authSlice";
import NavBar from "../components/NavBar";
import FancyCard from "../components/FancyCard";

export default function IndexPage() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);
  const [magic, setMagic] = useState(false);

  useHotkeys("ctrl+m", () => {
    setMagic(!magic);
  });

  return (
    <>
      <div className="w-full h-full ">
        <NavBar
          user={user}
          isLoggedIn={isLoggedIn}
          logout={() =>
            dispatch({
              type: "auth/logout",
            })
          }
        />
        <div className="container flex flex-col items-center justify-center px-6 pb-4 mx-auto my-6">
          <div className="space-y-2">
            <h1 className="text-center">{t("Home.leading")}</h1>
            <p className="text-xl text-center">
              {t("Courses.courses-adjusted-skill-level")}
            </p>
          </div>
        </div>
        <div className="container px-6 mx-auto">
          <div className="flex justify-center w-full h-full space-x-12">
            <FancyCard
              title={t("Courses.beginners")}
              description={t("Courses.beginners-info")}
              link="/courses"
              cardColor="bg-gray-50"
              shadowColor="shadow-emerald-500/50"
              hoverShadowColor="hover:shadow-emerald-500/50"
              buttonText={t("Home.learn-more")}
            />
            <FancyCard
              title={t("Courses.intermediate")}
              description={t("Courses.intermediate-info")}
              link="/courses"
              cardColor="bg-gray-50"
              shadowColor="shadow-indigo-500/50"
              hoverShadowColor="hover:shadow-indigo-500/50"
              buttonText={t("Home.learn-more")}
            />
          </div>
        </div>
        <div className="flex items-center justify-center my-16">
          <Image
            src={
              magic
                ? "https://preview.redd.it/wvzoz6ejs8v51.jpg?auto=webp&s=bbe9c737a52630a15573a0f461e316e757a26aa1"
                : "/undraw_online_test_gba7.png"
            }
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
