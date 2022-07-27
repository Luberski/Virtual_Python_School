import { Fragment, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import {
  AcademicCapIcon,
  InformationCircleIcon,
  PlusSmIcon,
} from '@heroicons/react/outline';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import {
  createLesson,
  deleteLesson,
  fetchLessons,
  selectLessonsData,
} from '@app/features/lessons/lessonsSlice';
import NavBar from '@app/components/NavBar';
import Button from '@app/components/Button';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import Input from '@app/components/Input';
import TextArea from '@app/components/TextArea';
import { WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';

type Props = {
  courseId: string;
};

export default function ManageCourseAndLessonsPage({ courseId }: Props) {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();

  const t = useTranslations();
  const lessons = useAppSelector(selectLessonsData);
  const cancelButtonRef = useRef(null);
  const { register, handleSubmit, setValue } =
    useForm<{
      name: string;
      description: string;
      answer: string;
    }>();

  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  // TODO: handle errors
  const onSubmit = async (data: {
    name: string;
    description: string;
    answer: string;
  }) => {
    const { name, description, answer } = data;

    try {
      dispatch(
        createLesson({
          courseId,
          name,
          description,
          type: 1,
          numberOfAnswers: 1,
          answer,
        })
      );
      setValue('name', '');
      setValue('description', '');
      setValue('answer', '');

      closeModal();
      notify();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteLesson = (id: string | number) => async () => {
    await dispatch(deleteLesson(id));
  };

  const notify = () =>
    toast.custom(
      (to) => (
        <button
          type="button"
          className="rounded-lg border-indigo-500 bg-indigo-200 py-3 px-4 text-indigo-900 shadow"
          onClick={() => toast.dismiss(to.id)}>
          <div className="flex justify-center space-x-1">
            <InformationCircleIcon className="h-6 w-6 text-indigo-500" />
            <div>
              <p className="font-bold">{t('Lessons.new-lesson-added')}</p>
            </div>
          </div>
        </button>
      ),
      {
        id: 'new-lesson-added-notification',
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
        <title>
          {t('Meta.title-manage')} - {WEBSITE_TITLE}
        </title>
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
          <div className="flex flex-col items-center sm:flex-row sm:items-start">
            <ul className="my-6 w-64 rounded-lg border border-neutral-300 bg-neutral-100 p-6 dark:border-neutral-600 dark:bg-neutral-800">
              <li className="menu-btn menu-btn-secondary mb-6 text-center">
                <Link href="/manage/courses">{t('Manage.manage-courses')}</Link>
              </li>
            </ul>
            <div className="container flex flex-col p-6 pb-4">
              <h1 className="pb-4">
                {
                  // TODO: display course name instead of courseId
                }
                {t('Manage.manage-course')}: #{courseId}
              </h1>
              <div className="flex items-center justify-between">
                <p className="text-xl font-medium">
                  {t('Lessons.list-of-lessons')}
                </p>
                <IconButton
                  onClick={openModal}
                  variant={IconButtonVariant.PRIMARY}
                  icon={<PlusSmIcon className="h-5 w-5" />}>
                  {t('Manage.create')}
                </IconButton>
              </div>
              <Transition.Root show={isOpen} as={Fragment}>
                <Dialog
                  as="div"
                  className="fixed inset-0 z-10 overflow-y-auto"
                  initialFocus={cancelButtonRef}
                  onClose={setIsOpen}>
                  <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0">
                      <Dialog.Overlay className="fixed inset-0 bg-neutral-500 opacity-75 transition-opacity" />
                    </Transition.Child>

                    {/* This element is to trick the browser into centering the modal contents. */}
                    <span
                      className="hidden sm:inline-block sm:h-screen sm:align-middle"
                      aria-hidden="true">
                      &#8203;
                    </span>
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                      enterTo="opacity-100 translate-y-0 sm:scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                      leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                      <div className="relative inline-block overflow-hidden rounded-lg bg-neutral-100 text-left align-bottom shadow-2xl transition-all dark:bg-neutral-900 sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                        <div className="bg-neutral-100 px-4 pt-5 pb-4 dark:bg-neutral-900 sm:p-6 sm:pb-4">
                          <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                              <AcademicCapIcon
                                className="h-6 w-6 text-indigo-600"
                                aria-hidden="true"
                              />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                              <Dialog.Title
                                as="h3"
                                className="text-xl font-medium leading-6">
                                {t('Lessons.create-new-lesson')}
                              </Dialog.Title>
                              <div className="mt-6">
                                <form
                                  className="flex flex-col items-start justify-center space-y-6"
                                  onSubmit={handleSubmit(onSubmit)}>
                                  <Input
                                    label="name"
                                    name="name"
                                    type="text"
                                    register={register}
                                    required
                                    maxLength={100}
                                    placeholder={t('Lessons.lesson-name')}
                                  />
                                  <TextArea
                                    label="description"
                                    name="description"
                                    type="text"
                                    register={register}
                                    required
                                    className="resize-none"
                                    rows={4}
                                    maxLength={2000}
                                    placeholder={t(
                                      'Lessons.lesson-description'
                                    )}
                                  />
                                  <Input
                                    label="answer"
                                    name="answer"
                                    type="text"
                                    register={register}
                                    required
                                    maxLength={100}
                                    placeholder={t('Lessons.answer')}
                                  />
                                  <div className="py-3">
                                    <IconButton
                                      variant={IconButtonVariant.PRIMARY}
                                      type="submit">
                                      {t('Lessons.create-lesson')}
                                    </IconButton>
                                  </div>
                                </form>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Transition.Child>
                  </div>
                </Dialog>
              </Transition.Root>
              <Toaster />
              {lessons && lessons.length > 0 ? (
                <div className="my-6 overflow-auto rounded-lg border border-neutral-300 dark:border-neutral-600">
                  <table className="table-auto divide-y divide-neutral-200">
                    <thead className="text-left font-medium uppercase text-neutral-500">
                      <tr>
                        <th scope="col" className="py-3 px-4">
                          ID
                        </th>
                        <th scope="col" className="py-3 px-4">
                          {t('Lessons.lesson-name')}
                        </th>
                        <th scope="col" className="w-full py-3 px-4">
                          {t('Lessons.lesson-description')}
                        </th>
                        <th
                          scope="col"
                          className="py-3 px-4 text-center"
                          colSpan={2}>
                          {t('Manage.manage')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {lessons.map((lesson) => (
                        <Fragment key={lesson.id}>
                          <tr>
                            <td className="p-4">{lesson.id}</td>
                            <td className="max-w-xs break-words p-4">
                              {lesson.name}
                            </td>
                            <td className="max-w-xs break-words p-4">
                              {lesson.description}
                            </td>
                            <td className="p-4">
                              <a href="#" className="menu-btn menu-btn-primary">
                                {t('Manage.edit')}
                              </a>
                            </td>
                            <td className="py-4 pr-4">
                              <Button
                                className="menu-btn menu-btn-danger"
                                onClick={handleDeleteLesson(lesson.id)}>
                                {t('Manage.delete')}
                              </Button>
                            </td>
                          </tr>
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col justify-center">
                  <p className="pb-8 text-lg font-medium">
                    {t('Lessons.no-lessons-found')}
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
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale, params }) => {
      const { courseId } = params as { courseId: string };
      await store.dispatch(fetchLessons(courseId));

      return {
        props: {
          courseId,
          i18n: Object.assign(
            {},
            await import(`../../../../../i18n/${locale}.json`)
          ),
        },
      };
    }
);
