import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import clsx from "clsx";

const NavBarMenu = () => {
  const router = useRouter();
  const t = useTranslations();

  return (
    <ul className="items-center hidden h-full xl:flex">
      <Link href="/" passHref={true}>
        <li
          className={clsx(
            router.pathname == "/"
              ? "text-indigo-800 bg-indigo-200 shadow-md shadow-indigo-200/50"
              : `text-gray-800`,
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
              ? "text-indigo-800 bg-indigo-200 shadow-lg shadow-indigo-200/50"
              : `text-gray-800`,
            "flex items-center px-4 py-2 text-sm font-medium  cursor-pointer rounded-xl"
          )}
        >
          {t("Home.courses")}
        </li>
      </Link>
    </ul>
  );
};

export default NavBarMenu;
