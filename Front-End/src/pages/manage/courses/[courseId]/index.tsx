import { Fragment, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  AcademicCapIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline';
import { PencilIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/solid';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import {
  createLesson,
  deleteLesson,
  editLesson,
  fetchLessons,
  selectLessonsData,
} from '@app/features/lessons/lessonsSlice';
import NavBar from '@app/components/NavBar';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import Input from '@app/components/Input';
import TextArea from '@app/components/TextArea';
import { WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';
import {
  editCourse,
  fetchCourse,
  selectCourseData,
} from '@app/features/courses/courseSlice';
import Button, { ButtonVariant } from '@app/components/Button';
import StyledDialog from '@app/components/StyledDialog';
import Checkbox from '@app/components/Checkbox';

type Props = {
  courseId: string;
};

export default function ManageCourseAndLessonsPage({ courseId }: Props) {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();

  const t = useTranslations();
  const lessons = useAppSelector(selectLessonsData);
  // TODO: use one selector for course and lessons and state
  const course = useAppSelector(selectCourseData);

  const { register, handleSubmit, setValue } =
    useForm<{
      name: string;
      description: string;
      answer: string;
    }>();

  const {
    register: registerCourseEdit,
    handleSubmit: handleCourseEditSubmit,
    setValue: setValueCourseEdit,
  } = useForm<{ name: string; description: string; featured: boolean }>();

  const {
    register: registerLessonEdit,
    handleSubmit: handleLessonEditSubmit,
    setValue: setValueLessonEdit,
  } = useForm<{ name: string; description: string; answer: string }>();

  const [isLessonCreateDialogOpen, setIsLessonCreateDialogOpen] =
    useState(false);
  const [isCourseEditDialogOpen, setIsCourseEditDialogOpen] = useState(false);
  const [isLessonEditDialogOpen, setIsLessonEditDialogOpen] = useState(false);
  const [isLessonDeleteDialogOpen, setIsLessonDeleteDialogOpen] =
    useState(false);
  const [currentLessonId, setCurrentLessonId] = useState<number>(null);

  const cancelButtonRef = useRef(null);

  const closeLessonCreateDialog = () => {
    setIsLessonCreateDialogOpen(false);
  };

  const openLessonCreateDialog = () => {
    setIsLessonCreateDialogOpen(true);
  };

  const closeCourseEditDialog = () => {
    setIsCourseEditDialogOpen(false);
  };

  const openCourseEditDialog = () => {
    setValueCourseEdit('featured', course?.featured);
    setIsCourseEditDialogOpen(true);
  };

  const closeLessonEditDialog = () => {
    setIsLessonEditDialogOpen(false);
  };

  const openLessonEditDialog = (lessonId: number) => () => {
    setCurrentLessonId(lessonId);
    setIsLessonEditDialogOpen(true);
  };

  const closeLessonDeleteDialog = () => {
    setIsLessonDeleteDialogOpen(false);
  };

  const openLessonDeleteDialog = (lessonId: number) => () => {
    setCurrentLessonId(lessonId);
    setIsLessonDeleteDialogOpen(true);
  };

  const onLessonCreateSubmit = async (data: {
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

      closeLessonCreateDialog();
      notify();
    } catch (error) {
      console.error(error);
    }
  };

  const onCourseEditSubmit = async (data: {
    name: string;
    description: string;
    featured: boolean;
  }) => {
    const { name, description, featured } = data;
    if (name.trim() || description.trim() || featured !== course?.featured) {
      try {
        dispatch(
          editCourse({
            courseId,
            name,
            description,
            featured,
          })
        );
        setValueCourseEdit('name', '');
        setValueCourseEdit('description', '');
        closeCourseEditDialog();
        notifyCourseEdited();
      } catch (error) {
        console.error(error);
      }
    }
  };

  // TODO: support more fields
  const onLessonEditSubmit = async (data: {
    name: string;
    description: string;
    answer: string;
  }) => {
    const { name, description, answer } = data;
    if (
      currentLessonId &&
      (name.trim() || description.trim() || answer.trim())
    ) {
      try {
        dispatch(
          editLesson({
            courseId: Number(courseId),
            lessonId: currentLessonId,
            name,
            description,
            type: 1,
            numberOfAnswers: 1,
            answer,
          })
        );
        setValueLessonEdit('name', '');
        setValueLessonEdit('description', '');
        setValueLessonEdit('answer', '');
        setCurrentLessonId(null);
        closeLessonEditDialog();
        notifyLessonEdited();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteLesson = async () => {
    await dispatch(deleteLesson(currentLessonId));
    closeLessonDeleteDialog();
    notifyLessonDeleted();
  };

  const notify = () =>
    toast.custom(
      (to) => (
        <button
          type="button"
          className="brand-shadow rounded-lg bg-indigo-100 py-3 px-4 text-indigo-900 shadow-indigo-900/25"
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

  const notifyCourseEdited = () =>
    toast.custom(
      (to) => (
        <button
          type="button"
          className="brand-shadow rounded-lg bg-indigo-100 py-3 px-4 text-indigo-900 shadow-indigo-900/25"
          onClick={() => toast.dismiss(to.id)}>
          <div className="flex justify-center space-x-1">
            <InformationCircleIcon className="h-6 w-6 text-indigo-500" />
            <div>
              <p className="font-bold">{t('Courses.course-edited')}</p>
            </div>
          </div>
        </button>
      ),
      {
        id: 'course-edited-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  const notifyLessonEdited = () =>
    toast.custom(
      (to) => (
        <button
          type="button"
          className="brand-shadow rounded-lg bg-indigo-100 py-3 px-4 text-indigo-900 shadow-indigo-900/25"
          onClick={() => toast.dismiss(to.id)}>
          <div className="flex justify-center space-x-1">
            <InformationCircleIcon className="h-6 w-6 text-indigo-500" />
            <div>
              <p className="font-bold">{t('Lessons.lesson-edited')}</p>
            </div>
          </div>
        </button>
      ),
      {
        id: 'lesson-edited-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  if (!user && !isLoggedIn) {
    return null;
  }

  const notifyLessonDeleted = () =>
    toast.custom(
      (to) => (
        <button
          type="button"
          className="brand-shadow rounded-lg border-red-500 bg-red-200 py-3 px-4 text-red-900 shadow-red-900/25"
          onClick={() => toast.dismiss(to.id)}>
          <div className="flex justify-center space-x-1">
            <InformationCircleIcon className="h-6 w-6 text-red-500" />
            <div>
              <p className="font-bold">{t('Lessons.lesson-deleted')}</p>
            </div>
          </div>
        </button>
      ),
      {
        id: 'lesson-deleted-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

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
            <div className="flex items-center space-x-2">
              <h1 className="pb-6 text-indigo-900 dark:text-indigo-300">
                {course?.name}
              </h1>
              <Button
                className="h-fit"
                variant={ButtonVariant.FLAT_PRIMARY}
                onClick={openCourseEditDialog}>
                {t('Manage.edit')}
              </Button>
            </div>
            <p className="word-wrap mb-6 text-2xl">{course?.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-medium">
                {t('Lessons.list-of-lessons')}
              </p>
              <IconButton
                onClick={openLessonCreateDialog}
                variant={IconButtonVariant.PRIMARY}
                icon={<PlusCircleIcon className="h-5 w-5" />}>
                {t('Manage.create')}
              </IconButton>
            </div>
            <StyledDialog
              title={t('Lessons.create-new-lesson')}
              isOpen={isLessonCreateDialogOpen}
              icon={
                <div className="h-fit rounded-lg bg-indigo-100 p-2">
                  <AcademicCapIcon className="h-6 w-6 text-indigo-900" />
                </div>
              }
              onClose={() =>
                setIsLessonCreateDialogOpen(!isLessonCreateDialogOpen)
              }>
              <div className="mt-6">
                <form
                  className="flex flex-col items-start justify-center space-y-6"
                  onSubmit={handleSubmit(onLessonCreateSubmit)}>
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
                    placeholder={t('Lessons.lesson-description')}
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
                  <div className="flex justify-between space-x-4 py-3">
                    <IconButton
                      variant={IconButtonVariant.PRIMARY}
                      type="submit">
                      {t('Lessons.create-lesson')}
                    </IconButton>
                    <Button
                      variant={ButtonVariant.FLAT_SECONDARY}
                      type="button"
                      onClick={closeLessonCreateDialog}
                      ref={cancelButtonRef}>
                      {t('Manage.cancel')}
                    </Button>
                  </div>
                </form>
              </div>
            </StyledDialog>
            <StyledDialog
              title={t('Courses.edit-course')}
              isOpen={isCourseEditDialogOpen}
              icon={
                <div className="h-fit rounded-lg bg-indigo-100 p-2">
                  <PencilIcon className="h-6 w-6 text-indigo-900" />
                </div>
              }
              onClose={() =>
                setIsCourseEditDialogOpen(!isCourseEditDialogOpen)
              }>
              <div className="mt-6">
                <form
                  className="flex flex-col items-start justify-center space-y-6"
                  onSubmit={handleCourseEditSubmit(onCourseEditSubmit)}>
                  <Input
                    label="name"
                    name="name"
                    type="text"
                    register={registerCourseEdit}
                    maxLength={100}
                    placeholder={t('Courses.course-name')}
                  />
                  <TextArea
                    label="description"
                    name="description"
                    type="text"
                    register={registerCourseEdit}
                    className="resize-none"
                    rows={4}
                    maxLength={2000}
                    placeholder={t('Courses.course-description')}
                  />
                  <div className="flex items-center">
                    <Checkbox
                      id="featured"
                      name="featured"
                      label="featured"
                      register={registerCourseEdit}
                    />
                    <label htmlFor="featured" className="ml-2">
                      {t('Courses.featured-on-homepage')}
                    </label>
                  </div>
                  <div className="flex justify-between space-x-4 py-3">
                    <IconButton
                      variant={IconButtonVariant.PRIMARY}
                      type="submit">
                      {t('Courses.edit-course')}
                    </IconButton>
                    <Button
                      variant={ButtonVariant.FLAT_SECONDARY}
                      type="button"
                      onClick={closeCourseEditDialog}
                      ref={cancelButtonRef}>
                      {t('Manage.cancel')}
                    </Button>
                  </div>
                </form>
              </div>
            </StyledDialog>
            <StyledDialog
              title={t('Lessons.edit-lesson')}
              isOpen={isLessonEditDialogOpen}
              icon={
                <div className="h-fit rounded-lg bg-indigo-100 p-2">
                  <PencilIcon className="h-6 w-6 text-indigo-900" />
                </div>
              }
              onClose={() =>
                setIsLessonEditDialogOpen(!isLessonEditDialogOpen)
              }>
              <div className="mt-6">
                <form
                  className="flex flex-col items-start justify-center space-y-6"
                  onSubmit={handleLessonEditSubmit(onLessonEditSubmit)}>
                  <Input
                    label="name"
                    name="name"
                    type="text"
                    register={registerLessonEdit}
                    maxLength={100}
                    placeholder={t('Lessons.lesson-name')}
                  />
                  <TextArea
                    label="description"
                    name="description"
                    type="text"
                    register={registerLessonEdit}
                    className="resize-none"
                    rows={4}
                    maxLength={2000}
                    placeholder={t('Lessons.lesson-description')}
                  />
                  <Input
                    label="answer"
                    name="answer"
                    type="text"
                    register={registerLessonEdit}
                    maxLength={100}
                    placeholder={t('Lessons.answer')}
                  />
                  <div className="flex justify-between space-x-4 py-3">
                    <IconButton
                      variant={IconButtonVariant.PRIMARY}
                      type="submit">
                      {t('Lessons.edit-lesson')}
                    </IconButton>
                    <Button
                      variant={ButtonVariant.FLAT_SECONDARY}
                      type="button"
                      onClick={closeLessonEditDialog}
                      ref={cancelButtonRef}>
                      {t('Manage.cancel')}
                    </Button>
                  </div>
                </form>
              </div>
            </StyledDialog>
            <StyledDialog
              title={t('Lessons.delete-lesson')}
              isOpen={isLessonDeleteDialogOpen}
              icon={
                <div className="h-fit rounded-lg bg-red-100 p-2">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-900" />
                </div>
              }
              onClose={() =>
                setIsLessonDeleteDialogOpen(!isLessonDeleteDialogOpen)
              }>
              <div className="my-2">
                <p className="my-2 font-bold text-red-400">
                  {t('Lessons.delete-lesson-confirmation')}
                </p>
                <div className="flex space-x-4 py-3">
                  <Button
                    type="button"
                    variant={ButtonVariant.DANGER}
                    onClick={handleDeleteLesson}>
                    {t('Manage.delete')}
                  </Button>
                  <Button
                    variant={ButtonVariant.FLAT_SECONDARY}
                    type="button"
                    onClick={closeLessonDeleteDialog}
                    ref={cancelButtonRef}>
                    {t('Manage.cancel')}
                  </Button>
                </div>
              </div>
            </StyledDialog>
            <Toaster />
            {lessons && lessons?.length > 0 ? (
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
                      <th scope="col" className="max-w-full py-3 px-4">
                        {t('Manage.description')}
                      </th>
                      <th scope="col" className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {lessons.map((lesson, key) => (
                      <Fragment key={lesson.id}>
                        <tr>
                          <td className="p-4">{(key += 1)}</td>
                          <td className="break-words p-4">{lesson.name}</td>
                          <td className="break-words p-4">
                            {lesson.description}
                          </td>
                          <td className="flex space-x-4 py-4 pr-4">
                            <IconButton
                              variant={IconButtonVariant.PRIMARY}
                              onClick={openLessonEditDialog(lesson.id)}
                              icon={<PencilIcon className="h-5 w-5" />}>
                              {t('Manage.edit')}
                            </IconButton>

                            <IconButton
                              variant={IconButtonVariant.DANGER}
                              icon={<TrashIcon className="h-5 w-5" />}
                              onClick={openLessonDeleteDialog(lesson.id)}>
                              {t('Manage.delete')}
                            </IconButton>
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
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale, params }) => {
      const { courseId } = params as { courseId: string };
      await store.dispatch(fetchCourse(courseId));
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
