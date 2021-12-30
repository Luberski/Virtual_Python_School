import React from "react";
import { useRouter } from "next/router";
import NavBar from "../../../components/NavBar";
import { useTranslations } from "next-intl";
import { GetStaticPaths } from "next";

export default function CoursePage() {
  const router = useRouter();
  const { slug } = router.query;
  const t = useTranslations();

  return (
    <>
      <div className="absolute w-full h-full">
        <NavBar />
        <div className="container flex flex-col justify-center px-6 pb-4 mx-auto my-6 lg:my-12 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-center first-letter:uppercase">
              {slug} course page
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      i18n: Object.assign({}, await import(`../../../../i18n/${locale}.json`)),
    },
  };
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};
