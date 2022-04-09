import { useEffect, useState } from 'react';
import Image from 'next/image';
import Footer from '../components/Footer';
import { useTranslations } from 'next-intl';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectIsLogged, selectAuthUser } from '../features/auth/authSlice';
import NavBar from '../components/NavBar';
import FancyCard from '../components/FancyCard';
import { useTheme } from 'next-themes';

// TODO: get featured courses from server
export default function IndexPage() {
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);
  const [magic, setMagic] = useState(false);
  const [magic2, setMagic2] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useHotkeys('ctrl+m', () => setMagic((prev) => !prev));
  useHotkeys('ctrl+b', () => setMagic2((prev) => !prev));

  return (
    <>
      <div
        className="w-full h-full"
        style={
          magic2
            ? {
                backgroundImage:
                  "url('https://img7.dmty.pl/uploads/201209/1348243292_by_whereswally_600.jpg')",
              }
            : {}
        }>
        <NavBar
          user={user}
          isLoggedIn={isLoggedIn}
          logout={() =>
            dispatch({
              type: 'auth/logout',
            })
          }
        />
        <div className="container flex flex-col justify-center items-center px-6 pb-4 my-6 mx-auto">
          <div className="space-y-2">
            <h1 className="text-center">{t('Home.leading')}</h1>
            <p className="text-xl text-center">
              {t('Courses.courses-adjusted-skill-level')}
            </p>
          </div>
        </div>
        <div className="container px-6 mx-auto">
          <div className="flex flex-col justify-center space-y-6 sm:flex-row sm:space-y-0 sm:space-x-12">
            <FancyCard
              title={t('Courses.beginners')}
              description={t('Courses.beginners-info')}
              link="/courses"
              cardColor="bg-gray-50"
              shadowColor="shadow-gray-500/50"
              hoverShadowColor="hover:shadow-gray-500/50"
              buttonText={t('Home.learn-more')}
            />
            <FancyCard
              title={t('Courses.intermediate')}
              description={t('Courses.intermediate-info')}
              link="/courses"
              cardColor="bg-gray-50"
              shadowColor="shadow-gray-500/50"
              hoverShadowColor="hover:shadow-gray-500/50"
              buttonText={t('Home.learn-more')}
            />
          </div>
        </div>
        <div className="flex justify-center items-center my-16">
          <Image
            src={
              isMounted && magic && theme === 'light'
                ? 'https://preview.redd.it/wvzoz6ejs8v51.jpg?auto=webp&s=bbe9c737a52630a15573a0f461e316e757a26aa1'
                : magic && isMounted && theme === 'dark'
                ? 'https://cdn.discordapp.com/attachments/897896380616572948/956540022423715850/unknown.png'
                : '/undraw_online_learning_re_qw08.svg'
            }
            alt="online_learning"
            width="466"
            height="330"
          />
        </div>
        <Footer />
      </div>
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      i18n: Object.assign({}, await import(`../../i18n/${locale}.json`)),
    },
  };
}
