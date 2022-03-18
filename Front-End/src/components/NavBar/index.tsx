import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ButtonLink, { ButtonLinkVariant } from "../ButtonLink";
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
                <a className="block ml-3 text-base font-bold leading-tight tracking-normal text-gray-700 no-underline dark:text-gray-300 hover:no-underline">
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
                        src="data:image/jpeg;base64,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"
                        alt="avatar"
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
                        <ButtonLink variant={ButtonLinkVariant.SECONDARY}>
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
