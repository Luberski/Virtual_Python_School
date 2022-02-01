import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ButtonLink from "../ButtonLink";
import { User } from "../../models/User";
import { ThemeButton } from "../ThemeButton";
import { Disclosure } from "@headlessui/react";
import clsx from "clsx";
import { useRouter } from "next/router";
import Button from "../Button";

type NavBarProps = {
  isLoggedIn?: boolean;
  user?: User | null;
  logout?: () => void;
};

const NavBar = ({ user, isLoggedIn, logout }: NavBarProps) => {
  const router = useRouter();
  const t = useTranslations();

  return (
    <Disclosure
      as="nav"
      className="w-full mx-auto"
      suppressHydrationWarning={true}
    >
      {({ open }) => (
        <div className="container flex items-center justify-between px-6 py-4 mx-auto xl:h-16 lg:items-stretch">
          <div className="flex items-center h-full">
            <div className="mr-10">
              <Link href="/" passHref={true}>
                <a className="block ml-3 text-base font-bold leading-tight tracking-normal text-indigo-700 no-underline dark:text-indigo-300 hover:no-underline">
                  Virtual Python School
                </a>
              </Link>
            </div>
            <ul className="items-center hidden space-x-2 xl:flex">
              <Link href="/" passHref={true}>
                <a
                  className={clsx(
                    "menu-btn",
                    router.pathname === "/"
                      ? "menu-btn-primary"
                      : `menu-btn-secondary`
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
          </div>

          <div className="items-center justify-end hidden h-full xl:flex">
            <div className="flex items-center w-full h-full">
              <div className="flex w-full h-full">
                <div
                  aria-haspopup="true"
                  className="flex items-center justify-end w-full cursor-pointer"
                >
                  {isLoggedIn && user ? (
                    <div className="flex items-center">
                      <div
                        className="w-48 text-right text-sm word-wrap truncate mx-4"
                        title={`${user?.name} ${user?.lastName}`}
                      >
                        {user?.name} {user?.lastName}
                      </div>
                      <Image
                        className="object-cover rounded"
                        src="https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/3b/3b80afb3cc996edde4b3c8d599196c032410f754_full.jpg"
                        alt="logo"
                        width={40}
                        height={40}
                      />
                      <Button className="menu-btn-danger ml-4" onClick={logout}>
                        {t("Auth.logout")}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-4">
                      <Link href="/login" passHref={true}>
                        <ButtonLink className="btn-primary">
                          {t("Auth.login")}
                        </ButtonLink>
                      </Link>
                      {/* <Link href="/register" passHref={true}>
                        <ButtonLink className="btn-primary">
                          {t("Auth.register")}
                        </ButtonLink>
                      </Link> */}
                    </div>
                  )}
                  <ThemeButton />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end xl:hidden">
            {open ? (
              <Disclosure.Button className="xl:hidden">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Disclosure.Button>
            ) : (
              <Disclosure.Button className="xl:hidden">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Disclosure.Button>
            )}
            <Disclosure.Panel className="py-2 xl:hidden">
              <div className="flex flex-col space-y-2">
                <Link href="/" passHref={true}>
                  <a
                    className={clsx(
                      "menu-btn",
                      router.pathname === "/"
                        ? "menu-btn-primary"
                        : `menu-btn-secondary`
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
                {isLoggedIn && user ? (
                  <div className="flex items-center">
                    <div
                      className="w-20 text-right text-sm word-wrap truncate mx-4"
                      title={`${user?.name} ${user?.lastName}`}
                    >
                      {user?.name} {user?.lastName}
                    </div>
                    <Image
                      className="object-cover rounded"
                      src="https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/3b/3b80afb3cc996edde4b3c8d599196c032410f754_full.jpg"
                      alt="logo"
                      width={40}
                      height={40}
                    />
                    <Button className="menu-btn-danger ml-4" onClick={logout}>
                      {t("Auth.logout")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <Link href="/login" passHref={true}>
                      <a className="menu-btn menu-btn-secondary">
                        {t("Auth.login")}
                      </a>
                    </Link>
                    {/* <Link href="/register" passHref={true}>
                      <a className="text-indigo-600 menu-btn menu-btn-secondary dark:text-indigo-300">
                        {t("Auth.register")}
                      </a>
                    </Link> */}
                    <ThemeButton />
                  </div>
                )}
              </div>
            </Disclosure.Panel>
          </div>
        </div>
      )}
    </Disclosure>
  );
};

export default NavBar;
