import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import clsx from "clsx";

const NavBarMenu = () => {
  const router = useRouter();
  const t = useTranslations();

  return (
    <ul className="items-center hidden h-full xl:flex space-x-2">
      <Link href="/" passHref={true}>
        <a
          className={clsx(
            "menu-btn",
            router.pathname === "/" ? "menu-btn-primary" : `menu-btn-secondary`
          )}
        >
          {t("Home.home")}
        </a>
      </Link>

      <Link href="/courses" passHref={true}>
        <a
          className={clsx(
            "menu-btn",
            router.pathname === "/courses"
              ? "menu-btn-primary"
              : `menu-btn-secondary`
          )}
        >
          {t("Home.courses")}
        </a>
      </Link>
    </ul>
  );
};

export default NavBarMenu;
