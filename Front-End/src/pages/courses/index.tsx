import React from "react";
import Footer from "../../components/Footer";
import { useTranslations } from "next-intl";
import NavBar from "../../components/NavBar";
import FancyCard from "../../components/FancyCard";
import { selectAuthUser, selectIsLogged } from "../../features/auth/authSlice";
import { useAppSelector } from "../../hooks";

export default function CoursesPage() {
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);
  const t = useTranslations();

  return (
    <>
      <div className="absolute w-full h-full">
        <NavBar user={user} isLoggedIn={isLoggedIn} />
        <div className="container flex flex-col items-center justify-center px-6 pb-4 mx-auto my-6">
          <div className="space-y-2">
            <h1 className="text-center">{t("Home.courses")}</h1>
            <p className="text-xl text-center">
              {t("Courses.choose-skill-level")}
            </p>
          </div>
        </div>
        <div className="container px-6 mx-auto">
          <div className="flex justify-center w-full h-full space-x-12">
            <FancyCard
              title={t("Courses.beginners")}
              description={t("Courses.beginners-info")}
              link="/courses"
              cardColor="bg-emerald-200"
              shadowColor="shadow-emerald-200/50"
              hoverShadowColor="hover:shadow-emerald-400/50"
              buttonText={t("Courses.enroll")}
            />
            <FancyCard
              title={t("Courses.intermediate")}
              description={t("Courses.intermediate-info")}
              link="/courses"
              cardColor="bg-indigo-200"
              shadowColor="shadow-indigo-200/50"
              hoverShadowColor="hover:shadow-indigo-400/50"
              buttonText={t("Courses.enroll")}
            />
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
      i18n: Object.assign({}, await import(`../../../i18n/${locale}.json`)),
    },
  };
}
