import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Disclosure } from '@headlessui/react';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import ButtonLink, { ButtonLinkVariant } from '../ButtonLink';
import type { User } from '../../models/User';
import { ThemeButton } from '../ThemeButton';
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
        <div className="container mx-auto flex items-center justify-between py-4 px-6 lg:items-stretch xl:h-16">
          <div className="flex h-full items-center">
            {!open && (
              <div className="sm:mr-10">
                <Link href="/" passHref={true}>
                  <a className="ml-3 text-base font-bold leading-tight tracking-normal text-gray-700 no-underline hover:no-underline dark:text-gray-300">
                    Virtual Python School
                  </a>
                </Link>
              </div>
            )}
            <ul className="hidden items-center space-x-2 xl:flex">
              <li>
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
              </li>
              <li>
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
              </li>
              <li>
                <Link href="/courses/enrolled" passHref={true}>
                  <a
                    className={clsx(
                      'menu-btn',
                      router.pathname === '/courses/enrolled'
                        ? 'menu-btn-primary'
                        : `menu-btn-secondary`
                    )}>
                    {t('Meta.title-enrolled-courses')}
                  </a>
                </Link>
                <Link href="/playground" passHref={true}>
                  <a
                    className={clsx(
                      'menu-btn',
                      router.pathname === '/playground'
                        ? 'menu-btn-primary'
                        : `menu-btn-secondary`
                    )}>
                    {t('Meta.title-playground')}
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div className="hidden h-full items-center justify-end xl:flex">
            <div className="flex h-full w-full items-center">
              <div className="flex h-full w-full">
                <div
                  aria-haspopup="true"
                  className="flex w-full cursor-pointer items-center justify-end">
                  {isLoggedIn && user ? (
                    <div className="flex items-center justify-center">
                      <div
                        className="mx-4 flex w-48 items-center justify-end truncate text-sm"
                        title={`${user?.name} ${user?.lastName}`}>
                        {user?.name} {user?.lastName}
                      </div>
                      <Button className="menu-btn-danger ml-4" onClick={logout}>
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
                  className="h-6 w-6"
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
                  className="h-6 w-6"
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
                <Link href="/courses/enrolled" passHref={true}>
                  <a
                    className={clsx(
                      'menu-btn',
                      router.pathname === '/courses/enrolled'
                        ? 'menu-btn-primary'
                        : `menu-btn-secondary`
                    )}>
                    {t('Meta.title-enrolled-courses')}
                  </a>
                </Link>
                <Link href="/playground" passHref={true}>
                  <a
                    className={clsx(
                      'menu-btn',
                      router.pathname === '/playground'
                        ? 'menu-btn-primary'
                        : `menu-btn-secondary`
                    )}>
                    {t('Meta.title-playground')}
                  </a>
                </Link>
                {isLoggedIn && user ? (
                  <div className="flex items-center">
                    <div
                      className="mx-4 w-20 truncate text-sm"
                      title={`${user?.name} ${user?.lastName}`}>
                      {user?.name} {user?.lastName}
                    </div>
                    <Button className="menu-btn-danger ml-4" onClick={logout}>
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
