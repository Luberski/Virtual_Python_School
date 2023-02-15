import { useTranslations } from 'next-intl';
import toast, { Toaster } from 'react-hot-toast';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import {
  ExclamationCircleIcon,
  InformationCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { PlusCircleIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import NavBar from '@app/components/NavBar';
import { WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import {
  deleteGlobalKnowledgeTest,
  fetchGlobalKnowledgeTests,
  selectGlobalKnowledgeTestsData,
} from '@app/features/dynamic-courses/global-knowledge-test/globalKnowledgeTestsSlice';
import Footer from '@app/components/Footer';
import Button, { ButtonVariant } from '@app/components/Button';
import StyledDialog from '@app/components/StyledDialog';
import IconButtonLink from '@app/components/IconButtonLink';

export default function ManageGlobalKnowledgeTestsPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();

  const t = useTranslations();
  const pageTitle = `${t('Meta.title-manage')} - ${WEBSITE_TITLE}`;
  const globalKnowledgeTests = useAppSelector(selectGlobalKnowledgeTestsData);
  const [
    isGlobaldeleteGlobalKnowledgeTestDeleteDialogOpen,
    setIsGlobaldeleteGlobalKnowledgeTestDeleteDialogOpen,
  ] = useState(false);
  const [
    currentGlobaldeleteGlobalKnowledgeTestId,
    setCurrentGlobaldeleteGlobalKnowledgeTestId,
  ] = useState<number>(null);
  const cancelButtonRef = useRef(null);

  const closeGlobaldeleteGlobalKnowledgeTestDeleteDialog = () => {
    setIsGlobaldeleteGlobalKnowledgeTestDeleteDialogOpen(false);
  };

  const openGlobaldeleteGlobalKnowledgeTestDeleteDialog =
    (courseId: number) => () => {
      setCurrentGlobaldeleteGlobalKnowledgeTestId(courseId);
      setIsGlobaldeleteGlobalKnowledgeTestDeleteDialogOpen(true);
    };

  const handleDeleteGlobaldeleteGlobalKnowledgeTest = async () => {
    await dispatch(
      deleteGlobalKnowledgeTest(currentGlobaldeleteGlobalKnowledgeTestId)
    );
    closeGlobaldeleteGlobalKnowledgeTestDeleteDialog();
    notifyGlobaldeleteGlobalKnowledgeTestDeleted();
  };

  const notifyGlobaldeleteGlobalKnowledgeTestDeleted = () =>
    toast.custom(
      (to) => (
        <button
          type="button"
          className="brand-shadow rounded-lg border-red-500 bg-red-200 py-3 px-4 text-red-900 shadow-red-900/25"
          onClick={() => toast.dismiss(to.id)}>
          <div className="flex justify-center space-x-1">
            <InformationCircleIcon className="h-6 w-6" />
            <div>
              <p className="font-bold">
                {t('KnowledgeTest.knowledgeTest-deleted')}
              </p>
            </div>
          </div>
        </button>
      ),
      {
        id: 'deleteGlobalKnowledgeTest-deleted-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  if (!user && !isLoggedIn) {
    return null;
  }

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
        <div className="container mx-auto px-4">
          <div className="brand-shadow2 container flex flex-col rounded-lg bg-white p-9 shadow-black/25 dark:bg-neutral-800">
            <h1 className="pb-6 text-sky-900 dark:text-sky-300">
              {t('Manage.manage-global-knowledge-tests')}
            </h1>
            <div className="flex items-center justify-between">
              <p className="text-xl font-medium">
                {t('KnowledgeTest.list-of-knowledge-tests')}
              </p>
              <Link
                href="/manage/dynamic-courses/global-knowledge-tests/guidedGlobalKnowledgeTest"
                passHref>
                <IconButtonLink
                  variant={IconButtonVariant.PRIMARY}
                  icon={<PlusCircleIcon className="h-5 w-5" />}>
                  {t('Manage.create')}
                </IconButtonLink>
              </Link>
            </div>
            <StyledDialog
              title={t('KnowledgeTest.delete-knowledge-test')}
              isOpen={isGlobaldeleteGlobalKnowledgeTestDeleteDialogOpen}
              icon={
                <div className="h-fit rounded-lg bg-red-100 p-2">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-900" />
                </div>
              }
              onClose={() =>
                setIsGlobaldeleteGlobalKnowledgeTestDeleteDialogOpen(
                  !isGlobaldeleteGlobalKnowledgeTestDeleteDialogOpen
                )
              }>
              <div className="my-2">
                <p className="my-2 font-bold text-red-400">
                  {t('KnowledgeTest.delete-knowledge-test-confirmation')}
                </p>
                <div className="flex space-x-4 py-3">
                  <Button
                    name="dialog-delete-globalKnowledgeTest-button"
                    type="button"
                    variant={ButtonVariant.DANGER}
                    onClick={handleDeleteGlobaldeleteGlobalKnowledgeTest}>
                    {t('Manage.delete')}
                  </Button>
                  <Button
                    variant={ButtonVariant.FLAT_SECONDARY}
                    type="button"
                    onClick={closeGlobaldeleteGlobalKnowledgeTestDeleteDialog}
                    ref={cancelButtonRef}>
                    {t('Manage.cancel')}
                  </Button>
                </div>
              </div>
            </StyledDialog>
            {globalKnowledgeTests && globalKnowledgeTests.length > 0 ? (
              <div className="my-6 overflow-auto rounded-lg border border-neutral-300 dark:border-neutral-600">
                <table className="w-full table-auto divide-y divide-neutral-200">
                  <thead className="text-left font-medium uppercase text-neutral-500">
                    <tr>
                      <th scope="col" className="py-3 px-4">
                        {t('Manage.no-short')}
                      </th>
                      <th scope="col" className="py-3 px-4">
                        {t('Manage.name')}
                      </th>
                      <th scope="col" className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {globalKnowledgeTests.map((globalKnowledgeTest, key) => (
                      <tr
                        key={globalKnowledgeTest.id}
                        data-testid={`globalKnowledgeTest-${key}`}>
                        <td className="p-4">{(key += 1)}</td>
                        <td className="break-words p-4">
                          {globalKnowledgeTest.name}
                        </td>
                        <td className="flex space-x-4 py-4 pr-4">
                          <IconButton
                            variant={IconButtonVariant.DANGER}
                            icon={<TrashIcon className="h-5 w-5" />}
                            onClick={openGlobaldeleteGlobalKnowledgeTestDeleteDialog(
                              globalKnowledgeTest.id
                            )}>
                            {t('Manage.delete')}
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col justify-center">
                <p className="pb-8 text-lg font-medium">
                  {t('KnowledgeTest.no-knowledge-tests-found')}
                </p>
                <Image
                  src="/undraw_no_data_re_kwbl.svg"
                  alt="No data"
                  width={200}
                  height={200}
                />
              </div>
            )}
          </div>
          <Toaster />
          <Footer />
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale }) => {
      await store.dispatch(fetchGlobalKnowledgeTests());
      return {
        props: {
          i18n: Object.assign(
            {},
            await import(`../../../../../i18n/${locale}.json`)
          ),
        },
      };
    }
);
