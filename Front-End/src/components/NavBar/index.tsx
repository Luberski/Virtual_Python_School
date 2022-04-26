import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ButtonLink, { ButtonLinkVariant } from '../ButtonLink';
import { User } from '../../models/User';
import { ThemeButton } from '../ThemeButton';
import { Disclosure } from '@headlessui/react';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import Button from '../Button';

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
      className="mx-auto w-full"
      suppressHydrationWarning={true}>
      {({ open }) => (
        <div className="container flex justify-between items-center py-4 px-6 mx-auto lg:items-stretch xl:h-16">
          <div className="flex items-center h-full">
            {!open && (
              <div className="sm:mr-10">
                <Link href="/" passHref={true}>
                  <a className="ml-3 text-base font-bold tracking-normal leading-tight text-gray-700 dark:text-gray-300 no-underline hover:no-underline">
                    Virtual Python School
                  </a>
                </Link>
              </div>
            )}
            <ul className="hidden items-center space-x-2 xl:flex">
              <Link href="/" passHref={true}>
                <a
                  className={clsx(
                    'menu-btn',
                    router.pathname === '/'
                      ? 'menu-btn-primary'
                      : `menu-btn-secondary`
                  )}>
                  {t('Home.home')}
                </a>
              </Link>

              <Link href="/courses" passHref={true}>
                <a
                  className={clsx(
                    'menu-btn',
                    router.pathname === '/courses'
                      ? 'menu-btn-primary'
                      : `menu-btn-secondary`
                  )}>
                  {t('Home.courses')}
                </a>
              </Link>
            </ul>
          </div>

          <div className="hidden justify-end items-center h-full xl:flex">
            <div className="flex items-center w-full h-full">
              <div className="flex w-full h-full">
                <div
                  aria-haspopup="true"
                  className="flex justify-end items-center w-full cursor-pointer">
                  {isLoggedIn && user ? (
                    <div className="flex justify-center items-center">
                      <div
                        className="flex justify-end items-center mx-4 w-48 text-sm truncate"
                        title={`${user?.name} ${user?.lastName}`}>
                        {user?.name} {user?.lastName}
                      </div>
                      <Button className="ml-4 menu-btn-danger" onClick={logout}>
                        {t('Auth.logout')}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-4">
                      <Link href="/login" passHref={true}>
                        <ButtonLink variant={ButtonLinkVariant.SECONDARY}>
                          {t('Auth.login')}
                        </ButtonLink>
                      </Link>
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
                  stroke="currentColor">
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
                  stroke="currentColor">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Disclosure.Button>
            )}
            <Disclosure.Panel className="py-2 xl:hidden">
              <div className="flex flex-col space-y-2">
                <Link href="/" passHref={true}>
                  <a
                    className={clsx(
                      'menu-btn',
                      router.pathname === '/'
                        ? 'menu-btn-primary'
                        : `menu-btn-secondary`
                    )}>
                    {t('Home.home')}
                  </a>
                </Link>
                <Link href="/courses" passHref={true}>
                  <a
                    className={clsx(
                      'menu-btn',
                      router.pathname === '/courses'
                        ? 'menu-btn-primary'
                        : `menu-btn-secondary`
                    )}>
                    {t('Home.courses')}
                  </a>
                </Link>
                {isLoggedIn && user ? (
                  <div className="flex items-center">
                    <div
                      className="mx-4 w-20 text-sm truncate"
                      title={`${user?.name} ${user?.lastName}`}>
                      {user?.name} {user?.lastName}
                    </div>
                    <Button className="ml-4 menu-btn-danger" onClick={logout}>
                      {t('Auth.logout')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <Link href="/login" passHref={true}>
                      <a className="menu-btn menu-btn-secondary">
                        {t('Auth.login')}
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
