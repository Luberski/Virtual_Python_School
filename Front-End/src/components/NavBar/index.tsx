import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import IconButton, {
  IconButtonSize,
  IconButtonVariant,
} from '@app/components/IconButton';
import ButtonLink, {
  ButtonLinkSize,
  ButtonLinkVariant,
} from '@app/components/ButtonLink';
import { ThemeButton } from '@app/components/ThemeButton';
import type { User } from '@app/models/User';

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
                  <a className="ml-3 text-base font-bold leading-tight tracking-normal text-indigo-900 no-underline hover:no-underline dark:text-indigo-300">
                    Virtual Python School
                  </a>
                </Link>
              </div>
            )}
            <ul className="hidden items-center space-x-2 xl:flex">
              <li>
                <Link href="/" passHref={true}>
                  <ButtonLink
                    variant={
                      router.pathname === '/'
                        ? ButtonLinkVariant.PRIMARY
                        : ButtonLinkVariant.FLAT_SECONDARY
                    }>
                    {t('Home.home')}
                  </ButtonLink>
                </Link>
              </li>
              <li>
                <Link href="/courses" passHref={true}>
                  <ButtonLink
                    variant={
                      router.pathname === '/courses'
                        ? ButtonLinkVariant.PRIMARY
                        : ButtonLinkVariant.FLAT_SECONDARY
                    }>
                    {t('Home.courses')}
                  </ButtonLink>
                </Link>
              </li>
              <li>
                <Link href="/courses/enrolled" passHref={true}>
                  <ButtonLink
                    variant={
                      router.pathname === '/courses/enrolled'
                        ? ButtonLinkVariant.PRIMARY
                        : ButtonLinkVariant.FLAT_SECONDARY
                    }>
                    {t('Meta.title-enrolled-courses')}
                  </ButtonLink>
                </Link>
              </li>
              <li>
                <Link href="/playground" passHref={true}>
                  <ButtonLink
                    variant={
                      router.pathname === '/playground'
                        ? ButtonLinkVariant.PRIMARY
                        : ButtonLinkVariant.FLAT_SECONDARY
                    }>
                    {t('Meta.title-playground')}
                  </ButtonLink>
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
                      <Menu
                        as="div"
                        className="relative inline-block rounded-md text-left">
                        <Menu.Button
                          title="Expand menu"
                          className="flex w-full items-center justify-center rounded-md p-2 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700">
                          <div
                            className="flex items-center truncate px-2"
                            title={`${user?.name} ${user?.lastName}`}>
                            {user?.name} {user?.lastName}
                          </div>
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95">
                          <Menu.Items
                            // eslint-disable-next-line tailwindcss/migration-from-tailwind-2
                            className="absolute right-0 mt-2 origin-top-right divide-y divide-neutral-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-800">
                            <div className="flex flex-col justify-end p-2">
                              <Menu.Item>
                                <Link href="/manage/courses" passHref={true}>
                                  <ButtonLink
                                    sizeType={ButtonLinkSize.EXTRA_LARGE}
                                    variant={ButtonLinkVariant.FLAT_PRIMARY}>
                                    {t('Manage.manage-courses')}
                                  </ButtonLink>
                                </Link>
                              </Menu.Item>
                              <Menu.Item>
                                <IconButton
                                  type="button"
                                  sizeType={IconButtonSize.EXTRA_LARGE}
                                  onClick={logout}
                                  variant={IconButtonVariant.FLAT_DANGER}
                                  icon={
                                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                  }>
                                  {t('Auth.logout')}
                                </IconButton>
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  ) : (
                    <div className="flex space-x-4">
                      <Link href="/login" passHref={true}>
                        <ButtonLink variant={ButtonLinkVariant.PRIMARY}>
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
                  <ButtonLink
                    variant={
                      router.pathname === '/'
                        ? ButtonLinkVariant.PRIMARY
                        : ButtonLinkVariant.FLAT_SECONDARY
                    }>
                    {t('Home.home')}
                  </ButtonLink>
                </Link>
                <Link href="/courses" passHref={true}>
                  <ButtonLink
                    variant={
                      router.pathname === '/courses'
                        ? ButtonLinkVariant.PRIMARY
                        : ButtonLinkVariant.FLAT_SECONDARY
                    }>
                    {t('Home.courses')}
                  </ButtonLink>
                </Link>
                <Link href="/courses/enrolled" passHref={true}>
                  <ButtonLink
                    variant={
                      router.pathname === '/courses/enrolled'
                        ? ButtonLinkVariant.PRIMARY
                        : ButtonLinkVariant.FLAT_SECONDARY
                    }>
                    {t('Meta.title-enrolled-courses')}
                  </ButtonLink>
                </Link>
                <Link href="/playground" passHref={true}>
                  <ButtonLink
                    variant={
                      router.pathname === '/playground'
                        ? ButtonLinkVariant.PRIMARY
                        : ButtonLinkVariant.FLAT_SECONDARY
                    }>
                    {t('Meta.title-playground')}
                  </ButtonLink>
                </Link>
                {isLoggedIn && user ? (
                  <div className="flex items-center">
                    <div
                      className="mx-4 w-20 truncate"
                      title={`${user?.name} ${user?.lastName}`}>
                      {user?.name} {user?.lastName}
                    </div>
                    <IconButton
                      type="button"
                      onClick={logout}
                      variant={IconButtonVariant.FLAT_DANGER}
                      icon={<ArrowRightOnRectangleIcon className="h-5 w-5" />}>
                      {t('Auth.logout')}
                    </IconButton>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <Link href="/login" passHref={true}>
                      <ButtonLink>{t('Auth.login')}</ButtonLink>
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
