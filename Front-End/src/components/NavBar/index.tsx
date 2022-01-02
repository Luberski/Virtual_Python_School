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

type NavBarProps = {
  isLoggedIn?: boolean;
  user?: User | null;
};

const NavBar = ({ user, isLoggedIn }: NavBarProps) => {
  const router = useRouter();

  const t = useTranslations();

  return (
    <Disclosure as="nav" className="w-full mx-auto">
      {({ open }) => (
        <div className="container flex items-center justify-between xl:h-16 py-4 px-6 mx-auto lg:items-stretch">
          <div className="flex items-center h-full">
            <div className="mr-10">
              <Link href="/" passHref={true}>
                <a className="ml-3 text-base font-bold text-indigo-700 dark:text-indigo-300 leading-tight tracking-normal block no-underline hover:no-underline">
                  Virtual Python School
                </a>
              </Link>
            </div>
            <ul className="hidden xl:flex items-center space-x-2">
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

          <div className="hidden xl:flex items-center justify-end h-full">
            <div className="flex items-center w-full h-full">
              <div className="flex w-full h-full">
                <div
                  aria-haspopup="true"
                  className="relative flex items-center justify-end w-full cursor-pointer"
                >
                  {isLoggedIn && user ? (
                    <div className="flex">
                      <p className="flex mx-4 text-sm items-center">
                        {user.name} {user.lastName}
                      </p>
                      <Image
                        className="object-cover w-10 h-10 rounded"
                        src="https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/3b/3b80afb3cc996edde4b3c8d599196c032410f754_full.jpg"
                        alt="logo"
                        width={40}
                        height={40}
                      />
                    </div>
                  ) : (
                    <div className="space-x-4">
                      <Link href="/login" passHref={true}>
                        <ButtonLink className="btn-secondary">
                          {t("Auth.login")}
                        </ButtonLink>
                      </Link>
                      <Link href="/register" passHref={true}>
                        <ButtonLink className="btn-primary">
                          {t("Auth.register")}
                        </ButtonLink>
                      </Link>
                    </div>
                  )}
                  <ThemeButton />
                </div>
              </div>
            </div>
          </div>
          <div className="xl:hidden flex flex-col items-end">
            {open ? (
              <Disclosure.Button className="xl:hidden">
                <svg
                  className="h-6 w-6"
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
                  className="h-6 w-6"
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
                  <div className="flex">
                    <div
                      className="space-x-2 word-wrap truncate w-24 text-sm"
                      title={`${user.name} ${user.lastName}`}
                    >
                      {user.name} {user.lastName}
                    </div>
                    <Image
                      className="object-cover w-10 h-10 rounded"
                      src="https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/3b/3b80afb3cc996edde4b3c8d599196c032410f754_full.jpg"
                      alt="logo"
                      width={40}
                      height={40}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <Link href="/login" passHref={true}>
                      <a className="menu-btn menu-btn-secondary">
                        {t("Auth.login")}
                      </a>
                    </Link>
                    <Link href="/register" passHref={true}>
                      <a className="menu-btn menu-btn-secondary text-indigo-600">
                        {t("Auth.register")}
                      </a>
                    </Link>
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
