import React from "react";
import Button from "../components/Button";
import Footer from "../components/Footer";
import { useTranslations } from "next-intl";
import NavBar from "../components/NavBar";

export default function CoursesPage() {
  const t = useTranslations();

  return (
    <>
      <div className="absolute w-full h-full bg-gray-50">
        <NavBar />
        <div className="container flex flex-col justify-center px-6 pb-4 mx-auto my-6 lg:my-12 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-4xl font-bold text-center text-gray-900">
              {t("Home.courses")}
            </h1>
            <h2 className="text-xl text-center text-gray-900">
              {t("Home.choose-skill-level")}
            </h2>
          </div>
        </div>
        <div className="container px-6 mx-auto">
          <div className="flex justify-center w-full h-full space-x-12">
            <div className="flex flex-col p-8 bg-emerald-200 shadow-md shadow-emerald-300/50 rounded-xl">
              <h3 className="text-xl font-bold">{t("Home.beginners")}</h3>
              <p className="text-gray-700 max-w-xs">
                {t("Home.beginners-info")}
              </p>
              <ul className="px-8 py-4 list-disc">
                <li>Introduction</li>
                <li>Basics</li>
                <li>Variables</li>
                <li>Functions</li>
                <li>Arrays</li>
                <li>Objects</li>
                <li>Classes</li>
                <li>Inheritance</li>
                <li>Polymorphism</li>
                <li>Encapsulation</li>
                <li>Abstraction</li>
                <li>Operators</li>
                <li>Input/Output</li>
                <li>Exceptions</li>
                <li>Debugging</li>
                <li>Unit testing</li>
                <li>File handling</li>
                <li>Sorting</li>
              </ul>
              <Button className="mt-16 w-42">{t("Courses.enroll")}</Button>
            </div>
            <div className="flex flex-col p-8 bg-indigo-200 shadow-md shadow-indigo-300/50 rounded-xl">
              <h3 className="text-xl font-bold">{t("Home.intermediate")}</h3>
              <p className="text-gray-700 max-w-xs">
                {t("Home.intermediate-info")}
              </p>
              <ul className="px-8 py-4 list-disc">
                <li>Introduction</li>
                <li>Basics</li>
                <li>Variables</li>
                <li>Functions</li>
                <li>Arrays</li>
                <li>Objects</li>
                <li>Classes</li>
                <li>Inheritance</li>
                <li>Polymorphism</li>
                <li>Encapsulation</li>
                <li>Abstraction</li>
                <li>Operators</li>
                <li>Input/Output</li>
                <li>Exceptions</li>
                <li>Debugging</li>
                <li>Unit testing</li>
                <li>File handling</li>
                <li>Regular expressions</li>
                <li>Sorting</li>
                <li>Algorithms</li>
                <li>Data structures</li>
                <li>Web development</li>
                <li>Web security</li>
                <li>Web APIs</li>
                <li>Web frameworks</li>
                <li>Web services</li>
                <li>Web scraping</li>
                <li>Loops and conditions</li>
              </ul>
              <Button className="mt-16 w-42">{t("Courses.enroll")}</Button>
            </div>
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
