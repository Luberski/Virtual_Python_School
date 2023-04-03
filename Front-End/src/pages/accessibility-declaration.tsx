import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import Footer from '@app/components/Footer';
import { useAppSelector } from '@app/hooks';
import { selectIsLogged, selectAuthUser } from '@app/features/auth/authSlice';
import NavBar from '@app/components/NavBar';
import { WEBSITE_TITLE } from '@app/constants';
import { fetchFeaturedCourses } from '@app/features/courses/featured/featuredCoursesSlice';
import { wrapper } from '@app/store';

export default function AccessibilityDeclarationPage() {
  const t = useTranslations();
  const pageTitle = `${t(
    'Meta.title-accessibility-declaration'
  )} - ${WEBSITE_TITLE}`;
  const dispatch = useDispatch();
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <div className="h-full w-full">
        <NavBar
          user={user}
          isLoggedIn={isLoggedIn}
          logout={() =>
            dispatch({
              type: 'auth/logout',
            })
          }
        />
        <div className="container mx-auto flex max-w-5xl flex-col items-center justify-center px-6 pb-6">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-sky-900 dark:text-sky-300">
              {t('AccessibilityDeclaration.leading')}
            </div>
            <p>{t('AccessibilityDeclaration.paragraph-1')}</p>
            <ul className="list-inside list-disc pl-6">
              <li>{t('AccessibilityDeclaration.date-of-publication')}</li>
              <li>
                {t('AccessibilityDeclaration.date-of-last-significant-update')}
              </li>
            </ul>
            <div className="text-2xl font-bold text-sky-900 dark:text-sky-300">
              {t('AccessibilityDeclaration.status')}
            </div>
            <p>{t('AccessibilityDeclaration.status-paragraph-1')}</p>
            <div className="text-2xl font-bold text-sky-900 dark:text-sky-300">
              {t('AccessibilityDeclaration.non-compliance')}
            </div>
            <ul className="list-inside list-disc pl-6">
              <li>{t('AccessibilityDeclaration.non-compliance-1')}</li>
              <li>{t('AccessibilityDeclaration.non-compliance-2')}</li>
            </ul>
            <div className="text-2xl font-bold text-sky-900 dark:text-sky-300">
              {t('AccessibilityDeclaration.preparation')}
            </div>
            <ul className="list-inside list-disc pl-6">
              <li>{t('AccessibilityDeclaration.preparation-date')}</li>
              <li>{t('AccessibilityDeclaration.last-review')}</li>
            </ul>
            <p>{t('AccessibilityDeclaration.self-assessment')}</p>
            <p>{t('AccessibilityDeclaration.keyboard-shortcuts')}</p>
            <div className="text-2xl font-bold text-sky-900 dark:text-sky-300">
              {t('AccessibilityDeclaration.feedback')}
            </div>
            <p>{t('AccessibilityDeclaration.feedback-paragraph-1')}</p>
            <a
              className="text-sky-900 dark:text-sky-300"
              href="mailto:kp46537@zut.edu.pl">
              kp46537@zut.edu.pl
            </a>
            ,&nbsp;
            <a
              className="text-sky-900 dark:text-sky-300"
              href="mailto:lm46581@zut.edu.pl">
              lm46581@zut.edu.pl
            </a>
            .<p>{t('AccessibilityDeclaration.paragraph-2')}</p>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale }) => {
      await store.dispatch(fetchFeaturedCourses());

      return {
        props: {
          i18n: Object.assign({}, await import(`../../i18n/${locale}.json`)),
        },
      };
    }
);
