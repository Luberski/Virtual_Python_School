import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import NavBarMenu from "../NavBarMenu";
import ButtonLink from "../ButtonLink";
import { User } from "../../models/User";
import { ThemeButton } from "../ThemeButton";

type NavBarProps = {
  isLoggedIn?: boolean;
  user?: User | null;
};

const NavBar = ({ user, isLoggedIn }: NavBarProps) => {
  const t = useTranslations();

  return (
    <nav className="w-full mx-auto">
      <div className="container flex items-center justify-between h-16 px-6 mx-auto lg:items-stretch">
        <div className="flex items-center h-full">
          <div className="flex items-center mr-10">
            <Link href="/" passHref={true}>
              <a className="hidden ml-3 text-base font-bold text-indigo-700 dark:text-indigo-300 leading-tight tracking-normal lg:block no-underline hover:no-underline">
                Virtual Python School
              </a>
            </Link>
          </div>
          <NavBarMenu />
        </div>
        <div className="items-center justify-end hidden h-full xl:flex">
          <div className="flex items-center w-full h-full">
            <div className="flex w-full h-full">
              <div
                aria-haspopup="true"
                className="relative flex items-center justify-end w-full cursor-pointer"
              >
                {isLoggedIn && user ? (
                  <div className="flex">
                    <ul className="absolute right-0 z-40 w-40 p-2 mt-48 bg-white border-r rounded ">
                      <li className="py-2 text-sm leading-3 tracking-normal text-gray-600 dark:text-gray-200 cursor-pointer hover:text-indigo-600 focus:text-indigo-600 focus:outline-none">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon icon-tabler icon-tabler-user"
                            width={20}
                            height={20}
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" />
                            <circle cx={12} cy={7} r={4} />
                            <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                          </svg>
                          <span className="ml-2">My Profile</span>
                        </div>
                      </li>
                      <li className="flex items-center py-2 mt-2 text-sm leading-3 tracking-normal text-gray-600 dark:text-gray-200 cursor-pointer hover:text-indigo-600 focus:text-indigo-600 focus:outline-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon icon-tabler icon-tabler-help"
                          width={20}
                          height={20}
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" />
                          <circle cx={12} cy={12} r={9} />
                          <line x1={12} y1={17} x2={12} y2="17.01" />
                          <path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4" />
                        </svg>
                        <span className="ml-2">Help Center</span>
                      </li>
                      <li className="flex items-center py-2 mt-2 text-sm leading-3 tracking-normal text-gray-600 dark:text-gray-200 cursor-pointer hover:text-indigo-600 focus:text-indigo-600 focus:outline-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon icon-tabler icon-tabler-settings"
                          width={20}
                          height={20}
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" />
                          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <circle cx={12} cy={12} r={3} />
                        </svg>
                        <span className="ml-2">Account Settings</span>
                      </li>
                    </ul>
                    <Image
                      className="object-cover w-10 h-10 rounded"
                      src="https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/3b/3b80afb3cc996edde4b3c8d599196c032410f754_full.jpg"
                      alt="logo"
                      width={40}
                      height={40}
                    />
                    <p className="flex ml-2 text-sm text-gray-800 items-center">
                      {user.name} {user.lastName}
                    </p>
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
        <div className="relative flex items-center visible xl:hidden">
          <ul className="absolute top-0 right-0 hidden w-64 p-2 mt-12 -ml-2 bg-white border-r rounded lg:mt-16">
            <li className="py-2 text-sm leading-3 tracking-normal text-gray-600 dark:text-gray-200 cursor-pointer hover:text-indigo-600 focus:text-indigo-600 focus:outline-none">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-user"
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" />
                  <circle cx={12} cy={7} r={4} />
                  <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                </svg>
                <span className="ml-2">Profile</span>
              </div>
            </li>
            <li className="flex py-2 mt-2 text-sm leading-3 tracking-normal text-gray-600 dark:text-gray-200 cursor-pointer xl:hidden hover:text-indigo-700 focus:text-indigo-700 focus:outline-none">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-grid"
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" />
                  <rect x={4} y={4} width={6} height={6} rx={1} />
                  <rect x={14} y={4} width={6} height={6} rx={1} />
                  <rect x={4} y={14} width={6} height={6} rx={1} />
                  <rect x={14} y={14} width={6} height={6} rx={1} />
                </svg>
                <span className="ml-2">Home</span>
              </div>
            </li>
            <li className="relative flex items-center py-2 mt-2 text-sm leading-3 tracking-normal text-gray-600 dark:text-gray-200 cursor-pointer xl:hidden hover:text-indigo-700 focus:text-indigo-700 focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-help"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" />
                <circle cx={12} cy={12} r={9} />
                <line x1={12} y1={17} x2={12} y2="17.01" />
                <path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4" />
              </svg>
              <span className="ml-2">Courses</span>
            </li>
            <li className="flex items-center py-2 mt-2 text-sm leading-3 tracking-normal text-gray-600 dark:text-gray-200 cursor-pointer xl:hidden hover:text-indigo-700 focus:text-indigo-700 focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-settings"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" />
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <circle cx={12} cy={12} r={3} />
              </svg>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
