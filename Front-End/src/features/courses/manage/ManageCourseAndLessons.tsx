import { Fragment, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  PencilIcon as PencilIconOutline,
  AcademicCapIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import ISO6391 from 'iso-639-1';
import { nanoid } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  changeLessonOrderDown,
  changeLessonOrderUp,
  createLesson,
  deleteLesson,
  editLesson,
} from '@app/features/lessons/lessonsSlice';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import Input from '@app/components/Input';
import TextArea from '@app/components/TextArea';
import { editCourse } from '@app/features/courses/courseSlice';
import Button, { ButtonVariant } from '@app/components/Button';
import StyledDialog from '@app/components/StyledDialog';
import Checkbox from '@app/components/Checkbox';
import type Course from '@app/models/Course';
import type Lesson from '@app/models/Lesson';
import Select from '@app/components/Select';
import { TAG_COLORS } from '@app/constants';
import {
  createCourseTag,
  deleteCourseTag,
} from '@app/features/tags/courseTagsSlice';
import type CourseTag from '@app/models/CourseTag';
import IconButtonLink, {
  IconButtonLinkVariant,
} from '@app/components/IconButtonLink';
import {
  fetchKnowledgeTestByLessonId,
  selectKnowledgeTestData,
} from '@app/features/dynamic-courses/knowledge-test/knowledgeTestSlice';
import { useAppSelector } from '@app/hooks';
import { deleteKnowledgeTestByLessonId } from '@app/features/dynamic-courses/knowledge-test/knowledgeTestsSlice';
import type AnswerCheckRule from '@app/models/AnswerCheckRule';

type ManageCourseAndLessonsProps = {
  course: Course;
  lessons: Lesson[];
  tags?: CourseTag[];
  translations: (key: string, ...params: unknown[]) => string;
};

type SelectOption = {
  id: string | number;
  value: string;
  label: string;
  disabled: boolean;
};

type AnswerCheckRuleOption = SelectOption & {
  value: AnswerCheckRule | string;
  label: AnswerCheckRule | string;
};

const answerCheckRules: AnswerCheckRuleOption[] = [
  {
    id: nanoid(),
    value: 'equal',
    label: 'equal',
    disabled: false,
  },
  {
    id: nanoid(),
    value: 'contain',
    label: 'contain',
    disabled: false,
  },
  {
    id: nanoid(),
    value: 'isString',
    label: 'isString',
    disabled: false,
  },
  {
    id: nanoid(),
    value: 'isInteger',
    label: 'isInteger',
    disabled: false,
  },
  {
    id: nanoid(),
    value: 'isFloat',
    label: 'isFloat',
    disabled: false,
  },
  {
    id: nanoid(),
    value: 'isBoolean',
    label: 'isBoolean',
    disabled: false,
  },
  {
    id: nanoid(),
    value: 'isTrue',
    label: 'isTrue',
    disabled: false,
  },
  {
    id: nanoid(),
    value: 'isFalse',
    label: 'isFalse',
    disabled: false,
  },
  {
    id: nanoid(),
    value: 'regex',
    label: 'regex',
    disabled: false,
  },
];

export default function ManageCourseAndLessons({
  course,
  lessons,
  translations,
  tags,
}: ManageCourseAndLessonsProps) {
  const dispatch = useDispatch();

  const {
    control: controlLessonCreate,
    register,
    handleSubmit,
    setValue,
  } = useForm<{
    name: string;
    description: string;
    answer: string;
    answerCheckRule: AnswerCheckRule | unknown;
  }>();

  const {
    control: controlCourseEdit,
    register: registerCourseEdit,
    handleSubmit: handleCourseEditSubmit,
    setValue: setValueCourseEdit,
  } = useForm<{
    name: string;
    description: string;
    featured: boolean;
    lang: string | unknown;
  }>();

  const {
    control: controlLessonEdit,
    register: registerLessonEdit,
    handleSubmit: handleLessonEditSubmit,
    setValue: setValueLessonEdit,
  } = useForm<{
    name: string;
    description: string;
    answer: string;
    answerCheckRule: AnswerCheckRule | unknown;
  }>();

  const {
    register: registerTagAdd,
    handleSubmit: handleTagAddSubmit,
    setValue: setValueTagAdd,
  } = useForm<{ name: string }>();

  const [isLessonCreateDialogOpen, setIsLessonCreateDialogOpen] =
    useState(false);
  const [isCourseEditDialogOpen, setIsCourseEditDialogOpen] = useState(false);
  const [isLessonEditDialogOpen, setIsLessonEditDialogOpen] = useState(false);
  const [isLessonDeleteDialogOpen, setIsLessonDeleteDialogOpen] =
    useState(false);
  const [currentLessonId, setCurrentLessonId] = useState<number>(null);

  const cancelButtonRef = useRef(null);
  const router = useRouter();

  const languageOptions: SelectOption[] = ISO6391.getAllCodes().map((code) => ({
    id: nanoid(),
    value: code,
    label: ISO6391.getNativeName(code),
    disabled: false,
  }));

  const [selectedLang, setSelectedLang] = useState(
    languageOptions.find((option) => option.value === course?.lang)
  );

  const [selectedAnswerCheckRule, setSelectedAnswerCheckRule] = useState(
    answerCheckRules[0]
  );

  const currentLessonKnowledgeTestData = useAppSelector(
    selectKnowledgeTestData
  );

  const closeLessonCreateDialog = () => {
    setValue('answerCheckRule', {
      id: nanoid(),
      value: 'equal',
      label: 'equal',
      disabled: false,
    } as SelectOption);
    setSelectedAnswerCheckRule({
      id: nanoid(),
      value: 'equal',
      label: 'equal',
      disabled: false,
    } as SelectOption);

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
    setValueLessonEdit(
      'name',
      lessons.find((lesson) => lesson.id === lessonId).name
    );
    setValueLessonEdit(
      'description',
      lessons.find((lesson) => lesson.id === lessonId).description
    );
    setValueLessonEdit(
      'answer',
      lessons.find((lesson) => lesson.id === lessonId).final_answer
    );
    setValueLessonEdit('answerCheckRule', {
      id: nanoid(),
      value: lessons.find((lesson) => lesson.id === lessonId).answer_check_rule,
      label: lessons.find((lesson) => lesson.id === lessonId).answer_check_rule,
      disabled: false,
    } as SelectOption);
    setSelectedAnswerCheckRule({
      id: nanoid(),
      value: lessons.find((lesson) => lesson.id === lessonId).answer_check_rule,
      label: lessons.find((lesson) => lesson.id === lessonId).answer_check_rule,
      disabled: false,
    } as SelectOption);

    setIsLessonEditDialogOpen(true);
  };

  const closeLessonDeleteDialog = () => {
    setIsLessonDeleteDialogOpen(false);
  };

  const openLessonDeleteDialog = (lessonId: number) => () => {
    setCurrentLessonId(lessonId);
    setIsLessonDeleteDialogOpen(true);
  };

  useEffect(() => {
    async function fetchData() {
      await dispatch(fetchKnowledgeTestByLessonId(currentLessonId));
    }
    if (currentLessonId) {
      fetchData();
    }
  }, [currentLessonId, dispatch]);

  const onLessonCreateSubmit = async (data: {
    name: string;
    description: string;
    answer: string;
    answerCheckRule: SelectOption;
  }) => {
    const { name, description, answer, answerCheckRule } = data;

    try {
      dispatch(
        createLesson({
          courseId: course.id,
          name,
          description,
          type: 1,
          numberOfAnswers: 1,
          answer,
          answerCheckRule:
            answerCheckRule?.value || selectedAnswerCheckRule?.value,
        })
      );
      setValue('name', '');
      setValue('description', '');
      setValue('answer', '');
      setValue('answerCheckRule', answerCheckRules[0]);

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
    lang: SelectOption;
  }) => {
    const { name, description, featured, lang } = data;
    if (
      name.trim() ||
      description.trim() ||
      featured !== course?.featured ||
      lang.value !== course?.lang
    ) {
      try {
        dispatch(
          editCourse({
            courseId: course.id,
            name,
            description,
            featured,
            lang: lang.value,
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
    answerCheckRule: SelectOption;
  }) => {
    const { name, description, answer, answerCheckRule } = data;
    if (
      currentLessonId &&
      (name.trim() ||
        description.trim() ||
        answer.trim() ||
        answerCheckRule.value)
    ) {
      try {
        dispatch(
          editLesson({
            courseId: course.id,
            lessonId: currentLessonId,
            name,
            description,
            type: 1,
            numberOfAnswers: 1,
            answer,
            answerCheckRule: answerCheckRule.value,
          })
        );
        setValueLessonEdit('name', '');
        setValueLessonEdit('description', '');
        setValueLessonEdit('answer', '');
        setValueLessonEdit('answerCheckRule', answerCheckRules[0]);
        setSelectedAnswerCheckRule(answerCheckRules[0]);
        setCurrentLessonId(null);

        closeLessonEditDialog();
        notifyLessonEdited();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const onTagsCreateSubmit = async (data: { name: string }) => {
    const { name } = data;
    try {
      await dispatch(
        createCourseTag({
          courseId: course.id,
          name,
        })
      ).unwrap();

      setValueTagAdd('name', '');
      notifyTagAdded();
    } catch (error) {
      console.error(error.message);
      notifyError(error.message);
    }
  };

  const handleDeleteLesson = async () => {
    await dispatch(deleteLesson(currentLessonId));
    closeLessonDeleteDialog();
    notifyLessonDeleted();
  };

  const handleCourseTagDelete = (tagId: number) => async () => {
    await dispatch(deleteCourseTag(tagId));
    notifyTagDeleted();
  };

  const handleDeleteKnowledgeTest = async () => {
    await dispatch(deleteKnowledgeTestByLessonId(currentLessonId));
    closeLessonEditDialog();
    notifyKnowledgeTestDeleted();
  };

  const handleMoveLessonOrderUp =
    (lessonId: number, currentOrder: number) => async () => {
      try {
        await dispatch(
          editLesson({
            courseId: course.id,
            lessonId: lessonId,
            order: currentOrder - 1,
          })
        ).unwrap();
        await dispatch(
          changeLessonOrderUp({
            lessonId: lessonId,
            currentOrder: currentOrder,
          })
        ).unwrap();
      } catch (error) {
        console.error(error);
      }
    };

  const handleMoveLessonOrderDown =
    (lessonId: number, currentOrder: number) => async () => {
      try {
        await dispatch(
          editLesson({
            courseId: course.id,
            lessonId: lessonId,
            order: currentOrder + 1,
          })
        ).unwrap();
        await dispatch(
          changeLessonOrderDown({
            lessonId: lessonId,
            currentOrder: currentOrder,
          })
        ).unwrap();
      } catch (error) {
        console.error(error);
      }
    };

  const notify = () =>
    toast.custom(
      (to) => (
        <button
          type="button"
          className="brand-shadow rounded-lg bg-sky-100 py-3 px-4 text-sky-900 shadow-sky-900/25"
          onClick={() => toast.dismiss(to.id)}>
          <div className="flex justify-center space-x-1">
            <InformationCircleIcon className="h-6 w-6" />
            <div>
              <p className="font-bold">
                {translations('Lessons.new-lesson-added')}
              </p>
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
          className="brand-shadow rounded-lg bg-sky-100 py-3 px-4 text-sky-900 shadow-sky-900/25"
          onClick={() => toast.dismiss(to.id)}>
          <div className="flex justify-center space-x-1">
            <InformationCircleIcon className="h-6 w-6" />
            <div>
              <p className="font-bold">
                {translations('Courses.course-edited')}
              </p>
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
          className="brand-shadow rounded-lg bg-sky-100 py-3 px-4 text-sky-900 shadow-sky-900/25"
          onClick={() => toast.dismiss(to.id)}>
          <div className="flex justify-center space-x-1">
            <InformationCircleIcon className="h-6 w-6" />
            <div>
              <p className="font-bold">
                {translations('Lessons.lesson-edited')}
              </p>
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

  const notifyLessonDeleted = () =>
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
                {translations('Lessons.lesson-deleted')}
              </p>
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

  const notifyTagAdded = () =>
    toast.custom(
      (to) => (
        <button
          type="button"
          className="brand-shadow rounded-lg bg-sky-100 py-3 px-4 text-sky-900 shadow-sky-900/25"
          onClick={() => toast.dismiss(to.id)}>
          <div className="flex justify-center space-x-1">
            <InformationCircleIcon className="h-6 w-6" />
            <div>
              <p className="font-bold">{translations('Tags.tag-added')}</p>
            </div>
          </div>
        </button>
      ),
      {
        id: 'tag-added-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  const intl = new Intl.DisplayNames(router.locale, {
    type: 'language',
  });

  const notifyTagDeleted = () =>
    toast.custom(
      (to) => (
        <button
          type="button"
          className="brand-shadow rounded-lg border-red-500 bg-red-200 py-3 px-4 text-red-900 shadow-red-900/25"
          onClick={() => toast.dismiss(to.id)}>
          <div className="flex justify-center space-x-1">
            <InformationCircleIcon className="h-6 w-6" />
            <div>
              <p className="font-bold">{translations('Tags.tag-deleted')}</p>
            </div>
          </div>
        </button>
      ),
      {
        id: 'tag-deleted-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  const notifyKnowledgeTestDeleted = () =>
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
                {translations('KnowledgeTest.knowledge-test-deleted')}
              </p>
            </div>
          </div>
        </button>
      ),
      {
        id: 'knowledge-test-deleted-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  const notifyError = (errorMessage: string) =>
    toast.custom(
      (to) => (
        <button
          type="button"
          className="brand-shadow rounded-lg border-red-500 bg-red-200 py-3 px-4 text-red-900 shadow-red-900/25"
          onClick={() => toast.dismiss(to.id)}>
          <div className="flex justify-center space-x-1">
            <InformationCircleIcon className="h-6 w-6" />
            <div>
              <p className="font-bold">{errorMessage}</p>
            </div>
          </div>
        </button>
      ),
      {
        id: 'error-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  return (
    <>
      <div className="flex items-center space-x-2">
        <h1 className="pb-6 text-sky-900 dark:text-sky-300">{course?.name}</h1>
        <Button
          className="h-fit"
          variant={ButtonVariant.FLAT_PRIMARY}
          onClick={openCourseEditDialog}>
          {translations('Manage.edit')}
        </Button>
      </div>
      {course?.lang && (
        <div className="mb-2">
          {translations('Meta.language')}:&nbsp;
          {intl?.of(course.lang).length > 2
            ? intl.of(course.lang)
            : ISO6391.getName(course.lang)}
        </div>
      )}
      <div className="mb-2 flex max-h-16 flex-wrap overflow-auto">
        {translations('Meta.tags')}:&nbsp;
        {tags?.length > 0 &&
          tags.map((tag, index) => (
            <div
              key={tag.id}
              className={`mr-1 inline-flex h-6 w-fit rounded-lg px-3 py-1 text-center text-xs font-semibold ${
                TAG_COLORS[index % TAG_COLORS.length]
              }`}>
              {tag.name}
              <button
                type="button"
                title={translations('Tags.delete-tag')}
                onClick={handleCourseTagDelete(tag.id)}
                className="ml-2 inline-flex items-center rounded-full text-sm hover:bg-neutral-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2">
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        <form
          className="flex flex-col items-start justify-center space-y-6"
          onSubmit={handleTagAddSubmit(onTagsCreateSubmit)}>
          <input
            type="text"
            name="name"
            required
            placeholder={translations('Tags.add-tag')}
            className="mr-1 h-6 w-fit rounded-lg border border-dashed border-sky-900 bg-transparent px-3 py-1 text-center text-xs font-semibold text-sky-900 hover:bg-sky-100 focus:ring-0 dark:border-sky-300 dark:text-sky-200 dark:placeholder:text-sky-300 dark:hover:bg-sky-200 dark:hover:text-sky-900 dark:hover:placeholder:text-sky-900"
            {...registerTagAdd('name')}
          />
          <input type="submit" hidden />
        </form>
      </div>

      {course?.description && (
        <p className="word-wrap mb-6">
          {translations('Manage.description')}:&nbsp;{course?.description}
        </p>
      )}
      <div className="flex items-center justify-between">
        <p className="text-xl font-medium">
          {translations('Lessons.list-of-lessons')}
        </p>
        <IconButton
          onClick={openLessonCreateDialog}
          variant={IconButtonVariant.PRIMARY}
          icon={<PlusCircleIcon className="h-5 w-5" />}>
          {translations('Manage.create')}
        </IconButton>
      </div>
      <StyledDialog
        title={translations('Lessons.create-new-lesson')}
        isOpen={isLessonCreateDialogOpen}
        icon={
          <div className="h-fit rounded-lg bg-sky-100 p-2">
            <AcademicCapIcon className="h-6 w-6 text-sky-900" />
          </div>
        }
        onClose={() => setIsLessonCreateDialogOpen(!isLessonCreateDialogOpen)}>
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
              placeholder={translations('Lessons.lesson-name')}
            />
            <TextArea
              label="description"
              name="description"
              type="text"
              register={register}
              required
              className="resize-none"
              rows={4}
              placeholder={translations('Lessons.lesson-description')}
            />
            <Controller
              control={controlLessonCreate}
              name="answerCheckRule"
              render={({ field: { onChange } }) => (
                <Select
                  options={answerCheckRules}
                  selected={selectedAnswerCheckRule}
                  setSelected={({ id, value, label, disabled }) => {
                    onChange({ id, value, label, disabled });
                    setSelectedAnswerCheckRule({ id, value, label, disabled });
                  }}
                />
              )}
            />
            {(selectedAnswerCheckRule.value === 'equal' ||
              selectedAnswerCheckRule.value === 'contain' ||
              selectedAnswerCheckRule.value === 'regex') && (
              <Input
                label="answer"
                name="answer"
                type="text"
                register={register}
                maxLength={100}
                placeholder={translations('Lessons.answer')}
              />
            )}
            <div className="flex justify-between space-x-4 py-3">
              <IconButton variant={IconButtonVariant.PRIMARY} type="submit">
                {translations('Lessons.create-lesson')}
              </IconButton>
              <Button
                variant={ButtonVariant.FLAT_SECONDARY}
                type="button"
                onClick={closeLessonCreateDialog}
                ref={cancelButtonRef}>
                {translations('Manage.cancel')}
              </Button>
            </div>
          </form>
        </div>
      </StyledDialog>
      <StyledDialog
        title={translations('Courses.edit-course')}
        isOpen={isCourseEditDialogOpen}
        icon={
          <div className="h-fit rounded-lg bg-sky-100 p-2">
            <PencilIconOutline className="h-6 w-6 text-sky-900" />
          </div>
        }
        onClose={() => setIsCourseEditDialogOpen(!isCourseEditDialogOpen)}>
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
              placeholder={translations('Courses.course-name')}
            />
            <TextArea
              label="description"
              name="description"
              type="text"
              register={registerCourseEdit}
              className="resize-none"
              rows={4}
              placeholder={translations('Courses.course-description')}
            />
            <Controller
              control={controlCourseEdit}
              name="lang"
              render={({ field: { onChange } }) => (
                <Select
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
                register={registerCourseEdit}
              />
              <label htmlFor="featured" className="ml-2">
                {translations('Courses.featured-on-homepage')}
              </label>
            </div>
            <div className="flex justify-between space-x-4 py-3">
              <IconButton variant={IconButtonVariant.PRIMARY} type="submit">
                {translations('Courses.edit-course')}
              </IconButton>
              <Button
                variant={ButtonVariant.FLAT_SECONDARY}
                type="button"
                onClick={closeCourseEditDialog}
                ref={cancelButtonRef}>
                {translations('Manage.cancel')}
              </Button>
            </div>
          </form>
        </div>
      </StyledDialog>
      <StyledDialog
        title={translations('Lessons.edit-lesson')}
        isOpen={isLessonEditDialogOpen}
        icon={
          <div className="h-fit rounded-lg bg-sky-100 p-2">
            <PencilIconOutline className="h-6 w-6 text-sky-900" />
          </div>
        }
        onClose={() => setIsLessonEditDialogOpen(!isLessonEditDialogOpen)}>
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
              placeholder={translations('Lessons.lesson-name')}
            />
            <TextArea
              label="description"
              name="description"
              type="text"
              register={registerLessonEdit}
              className="resize-none"
              rows={4}
              placeholder={translations('Lessons.lesson-description')}
            />
            <Controller
              control={controlLessonEdit}
              name="answerCheckRule"
              render={({ field: { onChange } }) => (
                <Select
                  options={answerCheckRules}
                  selected={selectedAnswerCheckRule}
                  setSelected={({ id, value, label, disabled }) => {
                    onChange({ id, value, label, disabled });
                    setSelectedAnswerCheckRule({ id, value, label, disabled });
                  }}
                />
              )}
            />
            {(selectedAnswerCheckRule.value === 'equal' ||
              selectedAnswerCheckRule.value === 'contain' ||
              selectedAnswerCheckRule.value === 'regex') && (
              <Input
                label="answer"
                name="answer"
                type="text"
                register={registerLessonEdit}
                maxLength={100}
                placeholder={translations('Lessons.answer')}
              />
            )}
            {currentLessonKnowledgeTestData ? (
              <IconButton
                variant={IconButtonVariant.DANGER}
                icon={<TrashIcon className="h-5 w-5" />}
                onClick={handleDeleteKnowledgeTest}>
                {translations('KnowledgeTest.delete-knowledge-test')}
              </IconButton>
            ) : (
              <Link
                href={`/manage/dynamic-courses/knowledge-test/lessons/${currentLessonId}`}
                passHref>
                <IconButtonLink
                  variant={IconButtonLinkVariant.OUTLINE_PRIMARY}
                  type="button"
                  icon={<AcademicCapIcon className="h-6 w-6" />}>
                  {translations('KnowledgeTest.create-knowledge-test')}
                </IconButtonLink>
              </Link>
            )}
            <div className="flex justify-between space-x-4 py-3">
              <IconButton variant={IconButtonVariant.PRIMARY} type="submit">
                {translations('Lessons.edit-lesson')}
              </IconButton>
              <Button
                variant={ButtonVariant.FLAT_SECONDARY}
                type="button"
                onClick={closeLessonEditDialog}
                ref={cancelButtonRef}>
                {translations('Manage.cancel')}
              </Button>
            </div>
          </form>
        </div>
      </StyledDialog>
      <StyledDialog
        title={translations('Lessons.delete-lesson')}
        isOpen={isLessonDeleteDialogOpen}
        icon={
          <div className="h-fit rounded-lg bg-red-100 p-2">
            <ExclamationCircleIcon className="h-6 w-6 text-red-900" />
          </div>
        }
        onClose={() => setIsLessonDeleteDialogOpen(!isLessonDeleteDialogOpen)}>
        <div className="my-2">
          <p className="my-2 font-bold text-red-400">
            {translations('Lessons.delete-lesson-confirmation')}
          </p>
          <div className="flex space-x-4 py-3">
            <Button
              type="button"
              variant={ButtonVariant.DANGER}
              onClick={handleDeleteLesson}>
              {translations('Manage.delete')}
            </Button>
            <Button
              variant={ButtonVariant.FLAT_SECONDARY}
              type="button"
              onClick={closeLessonDeleteDialog}
              ref={cancelButtonRef}>
              {translations('Manage.cancel')}
            </Button>
          </div>
        </div>
      </StyledDialog>
      {lessons && lessons?.length > 0 ? (
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
                <th scope="col" className="max-w-full py-3 px-4">
                  {translations('Manage.description')}
                </th>
                <th scope="col" className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {lessons
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((lesson) => {
                  return (
                    <Fragment key={lesson.id}>
                      <tr>
                        <td className="p-4">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <IconButton
                              variant={IconButtonVariant.FLAT_PRIMARY}
                              disabled={lesson.order === 1}
                              onClick={handleMoveLessonOrderUp(
                                lesson.id,
                                lesson.order
                              )}
                              icon={<ArrowUpIcon className="ml-2 h-5 w-5" />}
                            />
                            <div>{lesson.order}</div>
                            <IconButton
                              variant={IconButtonVariant.FLAT_PRIMARY}
                              disabled={lesson.order === lessons.length}
                              onClick={handleMoveLessonOrderDown(
                                lesson.id,
                                lesson.order
                              )}
                              icon={<ArrowDownIcon className="ml-1 h-5 w-5" />}
                            />
                          </div>
                        </td>
                        <td className="break-words p-4">{lesson.name}</td>
                        <td className="break-words p-4">
                          {lesson.description}
                        </td>
                        <td className="flex space-x-4 py-4 pr-4">
                          <IconButton
                            variant={IconButtonVariant.PRIMARY}
                            onClick={openLessonEditDialog(lesson.id)}
                            icon={<PencilIcon className="h-5 w-5" />}>
                            {translations('Manage.edit')}
                          </IconButton>

                          <IconButton
                            variant={IconButtonVariant.DANGER}
                            icon={<TrashIcon className="h-5 w-5" />}
                            onClick={openLessonDeleteDialog(lesson.id)}>
                            {translations('Manage.delete')}
                          </IconButton>
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col justify-center">
          <p className="pb-8 text-lg font-medium">
            {translations('Lessons.no-lessons-found')}
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
