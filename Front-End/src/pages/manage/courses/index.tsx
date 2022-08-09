import { Fragment, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import {
  AcademicCapIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline';
import { PencilIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/solid';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import {
  createCourse,
  deleteCourse,
  fetchCourses,
  selectCoursesData,
} from '@app/features/courses/coursesSlice';
import NavBar from '@app/components/NavBar';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import Input from '@app/components/Input';
import TextArea from '@app/components/TextArea';
import { WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';
import IconButtonLink, {
  IconButtonLinkSize,
  IconButtonLinkVariant,
} from '@app/components/IconButtonLink';
import Button, { ButtonVariant } from '@app/components/Button';
import Checkbox from '@app/components/Checkbox';

export default function ManageCoursesPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();

  const t = useTranslations();
  const courses = useAppSelector(selectCoursesData);
  const { register, handleSubmit, setValue } =
    useForm<{
      name: string;
      description: string;
      featured: boolean;
    }>();

  const [isOpen, setIsOpen] = useState(false);
  const cancelButtonRef = useRef(null);

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  // TODO: handle errors
  const onSubmit = async (data: {
    name: string;
    description: string;
    featured: boolean;
  }) => {
    const { name, description, featured } = data;

    try {
      dispatch(createCourse({ name, description, featured }));
      setValue('name', '');
      setValue('description', '');
      setValue('featured', false);
      closeModal();
      notify();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCourse = (id: string | number) => async () => {
    await dispatch(deleteCourse(id));
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
              <p className="font-bold">{t('Courses.new-course-added')}</p>
            </div>
          </div>
        </button>
      ),
      {
        id: 'new-course-added-notification',
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
          <div className="container flex flex-col rounded-lg bg-white p-9 shadow dark:bg-neutral-800">
            <h1 className="pb-4 text-indigo-900 dark:text-indigo-300">
              {t('Manage.manage-courses')}
            </h1>
            <div className="flex items-center justify-between">
              <p className="text-xl font-medium">
                {t('Courses.list-of-courses')}
              </p>
              <IconButton
                onClick={openModal}
                variant={IconButtonVariant.PRIMARY}
                icon={<PlusCircleIcon className="h-5 w-5" />}>
                {t('Manage.create')}
              </IconButton>
            </div>
            <Transition.Root show={isOpen} as={Fragment}>
              <Dialog
                as="div"
                className="fixed inset-0 z-10 overflow-y-auto"
                initialFocus={cancelButtonRef}
                onClose={setIsOpen}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0">
                  <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    <Dialog.Overlay className="fixed inset-0 bg-neutral-500 opacity-75 transition-opacity" />
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
                      <div className="relative inline-block overflow-hidden rounded-lg bg-white text-left align-bottom shadow-2xl transition-all dark:bg-neutral-900 sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                        <div className="bg-white px-4 pt-5 pb-4 dark:bg-neutral-900 sm:p-6 sm:pb-4">
                          <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                              <AcademicCapIcon
                                className="h-6 w-6 text-indigo-900"
                                aria-hidden="true"
                              />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                              <Dialog.Title
                                as="h3"
                                className="text-xl font-medium leading-6">
                                {t('Courses.create-new-course')}
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
                                    placeholder={t('Courses.course-name')}
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
                                      'Courses.course-description'
                                    )}
                                  />
                                  <div className="flex items-center">
                                    <Checkbox
                                      id="featured"
                                      name="featured"
                                      label="featured"
                                      register={register}
                                    />
                                    <label htmlFor="featured" className="ml-2">
                                      {t('Courses.featured-on-homepage')}
                                    </label>
                                  </div>
                                  <div className="flex justify-between space-x-4 py-3">
                                    <IconButton
                                      variant={IconButtonVariant.PRIMARY}
                                      type="submit">
                                      {t('Courses.create-course')}
                                    </IconButton>
                                    <Button
                                      variant={ButtonVariant.FLAT_SECONDARY}
                                      type="button"
                                      onClick={closeModal}
                                      ref={cancelButtonRef}>
                                      {t('Manage.cancel')}
                                    </Button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Transition.Child>
                  </div>
                </Transition.Child>
              </Dialog>
            </Transition.Root>
            <Toaster />
            {courses && courses.length > 0 ? (
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
                      <th scope="col" className="py-3 px-4 text-center">
                        {t('Courses.featured')}
                      </th>
                      <th scope="col" className="max-w-full py-3 px-4">
                        {t('Manage.description')}
                      </th>
                      <th scope="col" className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {courses.map((course, key) => (
                      <tr key={course.id}>
                        <td className="p-4">{(key += 1)}</td>
                        <td className="break-words p-4">{course.name}</td>
                        <td className="p-4 text-center">
                          <Checkbox
                            id="courseFeatured"
                            name="courseFeatured"
                            label="courseFeatured"
                            disabled={true}
                            checked={course.featured}
                          />
                        </td>
                        <td className="break-words p-4">
                          {course.description}
                        </td>
                        <td className="flex space-x-4 py-4 pr-4">
                          <Link
                            href={`/manage/courses/${course.id}`}
                            passHref={true}>
                            <IconButtonLink
                              variant={IconButtonLinkVariant.PRIMARY}
                              sizeType={IconButtonLinkSize.NORMAL}
                              icon={<PencilIcon className="h-5 w-5" />}>
                              {t('Manage.edit')}
                            </IconButtonLink>
                          </Link>
                          <IconButton
                            variant={IconButtonVariant.DANGER}
                            icon={<TrashIcon className="h-5 w-5" />}
                            onClick={handleDeleteCourse(course.id)}>
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
                  {t('Courses.no-courses-found')}
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
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale }) => {
      await store.dispatch(fetchCourses({}));

      return {
        props: {
          i18n: Object.assign(
            {},
            await import(`../../../../i18n/${locale}.json`)
          ),
        },
      };
    }
);
