import { useRef, useState } from 'react';
import Image from 'next/image';
import {
  AcademicCapIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@heroicons/react/20/solid';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import ISO6391 from 'iso-639-1';
import { useRouter } from 'next/router';
import { createCourse, deleteCourse } from '@app/features/courses/coursesSlice';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import Input from '@app/components/Input';
import TextArea from '@app/components/TextArea';
import IconButtonLink, {
  IconButtonLinkSize,
  IconButtonLinkVariant,
} from '@app/components/IconButtonLink';
import Button, { ButtonVariant } from '@app/components/Button';
import Checkbox from '@app/components/Checkbox';
import StyledDialog from '@app/components/StyledDialog';
import type Course from '@app/models/Course';
import Select from '@app/components/Select';
import { TAG_COLORS } from '@app/constants';

type ManageCoursesProps = {
  courses: Course[];
  translations: (key: string, ...params: unknown[]) => string;
};

type SelectOption = {
  id: string | number;
  value: string;
  label: string;
  disabled: boolean;
};

export default function ManageCourses({
  courses,
  translations,
}: ManageCoursesProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { control, register, handleSubmit, setValue } =
    useForm<{
      name: string;
      description: string;
      featured: boolean;
      lang: string | unknown;
    }>();

  const [isCourseCreateDialogOpen, setIsCourseCreateDialogOpen] =
    useState(false);
  const [isCourseDeleteDialogOpen, setIsCourseDeleteDialogOpen] =
    useState(false);
  const [currentCourseId, setCurrentCourseId] = useState<number>(null);

  const cancelButtonRef = useRef(null);

  const languageOptions: SelectOption[] = ISO6391.getAllCodes().map((code) => ({
    id: nanoid(),
    value: code,
    label: ISO6391.getNativeName(code),
    disabled: false,
  }));

  const [selectedLang, setSelectedLang] = useState(
    languageOptions.find((option) => option.value === router.locale ?? 'en')
  );

  const closeCourseCreateDialog = () => {
    setIsCourseCreateDialogOpen(false);
  };

  const openCourseCreateDialog = () => {
    setIsCourseCreateDialogOpen(true);
  };

  const closeCourseDeleteDialog = () => {
    setIsCourseDeleteDialogOpen(false);
  };

  const openCourseDeleteDialog = (courseId: number) => () => {
    setCurrentCourseId(courseId);
    setIsCourseDeleteDialogOpen(true);
  };

  const onCourseCreateSubmit = async (data: {
    name: string;
    description: string;
    featured: boolean;
    lang: { id: number; value: string; label: string; disabled: boolean };
  }) => {
    const { name, description, featured, lang } = data;

    try {
      dispatch(
        createCourse({ name, description, featured, lang: lang?.value })
      );
      setValue('name', '');
      setValue('description', '');
      setValue('featured', false);
      setValue('lang', '');
      closeCourseCreateDialog();
      notify();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCourse = async () => {
    await dispatch(deleteCourse(currentCourseId));
    closeCourseDeleteDialog();
    notifyCourseDeleted();
  };

  const notify = () =>
    toast.custom(
      (to) => (
        <button
          type="button"
          className="brand-shadow rounded-lg border-sky-500 bg-sky-200 py-3 px-4 text-sky-900 shadow-sky-900/25"
          onClick={() => toast.dismiss(to.id)}>
          <div className="flex justify-center space-x-1">
            <InformationCircleIcon className="h-6 w-6" />
            <div>
              <p className="font-bold">
                {translations('Courses.new-course-added')}
              </p>
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

  const notifyCourseDeleted = () =>
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
                {translations('Courses.course-deleted')}
              </p>
            </div>
          </div>
        </button>
      ),
      {
        id: 'course-deleted-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  return (
    <>
      <h1 className="pb-6 text-sky-900 dark:text-sky-300">
        {translations('Manage.manage-courses')}
      </h1>
      <div className="flex items-center justify-between">
        <p className="text-xl font-medium">
          {translations('Courses.list-of-courses')}
        </p>
        <IconButton
          onClick={openCourseCreateDialog}
          variant={IconButtonVariant.PRIMARY}
          icon={<PlusCircleIcon className="h-5 w-5" />}>
          {translations('Manage.create')}
        </IconButton>
      </div>
      <StyledDialog
        title={translations('Courses.create-new-course')}
        isOpen={isCourseCreateDialogOpen}
        icon={
          <div className="h-fit rounded-lg bg-sky-100 p-2">
            <AcademicCapIcon className="h-6 w-6 text-sky-900" />
          </div>
        }
        onClose={() => setIsCourseCreateDialogOpen(!isCourseCreateDialogOpen)}>
        <div className="mt-6 md:w-[1024px]">
          <form
            className="flex flex-col items-start justify-center space-y-6"
            onSubmit={handleSubmit(onCourseCreateSubmit)}>
            <Input
              label="name"
              name="name"
              type="text"
              register={register}
              className="w-full"
              required
              maxLength={100}
              placeholder={translations('Courses.course-name')}
            />
            <TextArea
              label="description"
              name="description"
              type="text"
              register={register}
              required
              className="w-full resize-none"
              rows={4}
              placeholder={translations('Courses.course-description')}
            />
            <Controller
              control={control}
              name="lang"
              render={({ field: { onChange } }) => (
                <Select
                  className="w-full"
                  options={languageOptions}
                  selected={selectedLang}
                  setSelected={({ id, value, label, disabled }) => {
                    onChange({ id, value, label, disabled });
                    setSelectedLang({ id, value, label, disabled });
                  }}
                />
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
                {translations('Courses.featured-on-homepage')}
              </label>
            </div>
            <div className="flex justify-between space-x-4 py-3">
              <IconButton variant={IconButtonVariant.PRIMARY} type="submit">
                {translations('Courses.create-course')}
              </IconButton>
              <Button
                variant={ButtonVariant.FLAT_SECONDARY}
                type="button"
                onClick={closeCourseCreateDialog}
                ref={cancelButtonRef}>
                {translations('Manage.cancel')}
              </Button>
            </div>
          </form>
        </div>
      </StyledDialog>
      <StyledDialog
        title={translations('Courses.delete-course')}
        isOpen={isCourseDeleteDialogOpen}
        icon={
          <div className="h-fit rounded-lg bg-red-100 p-2">
            <ExclamationCircleIcon className="h-6 w-6 text-red-900" />
          </div>
        }
        onClose={() => setIsCourseDeleteDialogOpen(!isCourseDeleteDialogOpen)}>
        <div className="my-2">
          <p className="my-2 font-bold text-red-400">
            {translations('Courses.delete-course-confirmation')}
          </p>
          <div className="flex space-x-4 py-3">
            <Button
              name="dialog-delete-course-button"
              type="button"
              variant={ButtonVariant.DANGER}
              onClick={handleDeleteCourse}>
              {translations('Manage.delete')}
            </Button>
            <Button
              variant={ButtonVariant.FLAT_SECONDARY}
              type="button"
              onClick={closeCourseDeleteDialog}
              ref={cancelButtonRef}>
              {translations('Manage.cancel')}
            </Button>
          </div>
        </div>
      </StyledDialog>
      {courses && courses.length > 0 ? (
        <div className="my-6 overflow-auto rounded-lg border border-neutral-300 dark:border-neutral-600">
          <table className="w-full table-auto divide-y divide-neutral-200">
            <thead className="text-left font-medium uppercase text-neutral-500">
              <tr>
                <th scope="col" className="py-3 px-4">
                  {translations('Manage.no-short')}
                </th>
                <th scope="col" className="py-3 px-4">
                  {translations('Manage.name')}
                </th>
                <th scope="col" className="py-3 px-4 text-center">
                  {translations('Courses.featured')}
                </th>
                <th scope="col" className="py-3 px-4">
                  {translations('Meta.language')}
                </th>
                <th scope="col" className="py-3 px-4">
                  {translations('Meta.tags')}
                </th>
                <th scope="col" className="max-w-full py-3 px-4">
                  {translations('Manage.description')}
                </th>
                <th scope="col" className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {courses.map((course, key) => {
                const intl = new Intl.DisplayNames(router.locale, {
                  type: 'language',
                });
                return (
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
                    <td>
                      {course.lang && (
                        <div className="mb-2 text-sm">
                          {intl?.of(course.lang).length > 2
                            ? intl.of(course.lang)
                            : ISO6391.getName(course.lang)}
                        </div>
                      )}
                    </td>
                    <td>
                      {course.tags && course.tags.length > 0 && (
                        <div className="mb-2 flex max-h-16 flex-wrap overflow-auto text-sm">
                          {course.tags.map((tag, index) => (
                            <div
                              key={tag.id}
                              className={`mr-1 mt-1 h-6 w-fit rounded-lg px-3 py-1 text-center text-xs font-semibold ${
                                TAG_COLORS[index % TAG_COLORS.length]
                              }`}>
                              {tag.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="break-words p-4">{course.description}</td>
                    <td className="flex space-x-4 py-4 pr-4">
                      <Link
                        href={`/manage/courses/${course.id}`}
                        passHref={true}>
                        <IconButtonLink
                          variant={IconButtonLinkVariant.PRIMARY}
                          sizeType={IconButtonLinkSize.NORMAL}
                          icon={<PencilIcon className="h-5 w-5" />}>
                          {translations('Manage.edit')}
                        </IconButtonLink>
                      </Link>
                      <IconButton
                        variant={IconButtonVariant.DANGER}
                        icon={<TrashIcon className="h-5 w-5" />}
                        onClick={openCourseDeleteDialog(course.id)}>
                        {translations('Manage.delete')}
                      </IconButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col justify-center">
          <p className="pb-8 text-lg font-medium">
            {translations('Courses.no-courses-found')}
          </p>
          <Image
            src="/undraw_no_data_re_kwbl.svg"
            alt="No data"
            width={200}
            height={200}
          />
        </div>
      )}
    </>
  );
}
