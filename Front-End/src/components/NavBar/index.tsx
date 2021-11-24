import Link from "next/link";
import React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import clsx from "clsx";

const NavBar = () => {
  const router = useRouter();
  const t = useTranslations();

  return (
    <ul className="items-center hidden h-full xl:flex">
      <Link href="/" passHref={true}>
        <li
          className={clsx(
            router.pathname == "/"
              ? "text-blue-700 bg-blue-100"
              : `text-gray-700`,
            "flex items-center px-4 py-2 text-sm font-medium  cursor-pointer rounded-xl"
          )}
        >
          {t("Home.home")}
        </li>
      </Link>

      <Link href="/courses" passHref={true}>
        <li
          className={clsx(
            router.pathname == "/courses"
              ? "text-blue-700 bg-blue-100"
              : `text-gray-700`,
            "flex items-center px-4 py-2 text-sm font-medium  cursor-pointer rounded-xl"
          )}
        >
          {t("Home.courses")}
        </li>
      </Link>
    </ul>
  );
};

export default NavBar;
