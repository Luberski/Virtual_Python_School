import Image from 'next/image';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import StyledDialog from '@app/components/StyledDialog';
import FancyToast from '@app/components/FancyToast';
import ClassroomDescriptorWrapper from '@app/components/ClassroomDescriptorWrapper';
import type Classroom from '@app/models/Classroom';
import { joinClassroom } from '@app/features/classrooms/joinClassroomSlice';
import { createClassroom } from '@app/features/classrooms/classroomsSlice';
import { useRef, useState } from 'react';
import Checkbox from '@app/components/Checkbox';
import Button, { ButtonVariant } from '@app/components/Button';
import { Controller, useForm } from 'react-hook-form';
import Input from '@app/components/Input';

type ClassroomsProps = {
  classrooms: Classroom[];
  translations: (key: string) => string;
};

export default function Classrooms({
  classrooms,
  translations,
}: ClassroomsProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isCreateClassroomDialogOpen, setIsCreateClassroomDialogOpen] =
    useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const { control, register, handleSubmit, setValue } =
    useForm<{
      name: string;
      is_public: boolean;
    }>();

  const cancelButtonRef = useRef(null);

  const closeLinkDialog = () => {
    setIsLinkDialogOpen(false);
  };
  const openLinkDialog = () => {
    setIsLinkDialogOpen(true);
  };

  const closeCreateClassroomDialog = () => {
    setIsCreateClassroomDialogOpen(false);
  };
  const openCreateClassroomDialog = () => {
    setIsCreateClassroomDialogOpen(true);
  };
  const onClassroomCreateSubmit = async (data: {
    name: string;
    is_public: boolean;
  }) => {
    const { name, is_public } = data;

    try {
      dispatch(createClassroom({ name, is_public }));
      setValue('name', '');
      setValue('is_public', false);
      notify();
    } catch (error) {
      console.error(error);
    }
  };

  const handleClassroomJoin = (classroomId: number) => async () => {
    await dispatch(joinClassroom(classroomId));
    notify();
    // wait 1 second to show the toast
    setTimeout(() => {
      toast.remove('classroom-joined-notification');
      router.push(`/classrooms/${classroomId}`);
    }, 1000);
  };

  const notify = () =>
    toast.custom(
      (to) =>
        to.visible && (
          <FancyToast
            message={translations('Courses.course-enrolled')}
            toastObject={to}
            className="border-indigo-500 bg-indigo-200 text-indigo-900"
          />
        ),
      {
        id: 'classroom-joined-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  return (
    <>
      <div className="mb-12 flex h-full flex-row items-center justify-center space-x-6">
        <Button
          variant={ButtonVariant.PRIMARY}
          type="button"
          onClick={openCreateClassroomDialog}
          ref={cancelButtonRef}>
          {translations('Classrooms.create')}
        </Button>
        <Button
          variant={ButtonVariant.PRIMARY}
          type="button"
          onClick={openLinkDialog}
          ref={cancelButtonRef}>
          {translations('Classrooms.link-join')}
        </Button>
        <StyledDialog
          title={translations('Classrooms.create')}
          isOpen={isCreateClassroomDialogOpen}
          onClose={closeCreateClassroomDialog}>
          <div className="py-6">
            <form
              method="dialog"
              onSubmit={handleSubmit(onClassroomCreateSubmit)}>
              <div className="flex flex-col gap-y-2">
                <Input
                  label="name"
                  name="name"
                  type="text"
                  register={register}
                  required
                  maxLength={50}
                  placeholder={translations(
                    'Classrooms.classroom-name'
                  )}></Input>
                <div className="flex items-center">
                  <Checkbox
                    id="is_public"
                    label="is_public"
                    name="is_public"
                    register={register}></Checkbox>
                  <label htmlFor="featured" className="ml-2">
                    {translations('Classrooms.is-public-checkbox')}
                  </label>
                </div>
              </div>
              <div className="mt-6 flex flex-row items-center justify-end">
                <Button
                  onClick={closeCreateClassroomDialog}
                  className="mr-2"
                  variant={ButtonVariant.DANGER}>
                  Cancel
                </Button>
                <Button type="submit" variant={ButtonVariant.PRIMARY}>
                  Send
                </Button>
              </div>
            </form>
          </div>
        </StyledDialog>
        <StyledDialog
          title={translations('Classrooms.link-join')}
          isOpen={isLinkDialogOpen}
          onClose={closeLinkDialog}>
          <div className="py-6">
            <form
              method="dialog"
              onSubmit={handleSubmit(onClassroomCreateSubmit)}>
              <div className="flex flex-col gap-y-2">
                <Input
                  label="name"
                  name="name"
                  type="text"
                  register={register}
                  required
                  maxLength={50}
                  placeholder={translations('Classrooms.link')}></Input>
              </div>
              <div className="mt-6 flex flex-row items-center justify-end">
                <Button
                  onClick={closeLinkDialog}
                  className="mr-2"
                  variant={ButtonVariant.DANGER}>
                  Cancel
                </Button>
                <Button type="submit" variant={ButtonVariant.PRIMARY}>
                  Send
                </Button>
              </div>
            </form>
          </div>
        </StyledDialog>
      </div>
      {classrooms && classrooms.length > 0 ? (
        <div className="flex flex-col justify-center space-y-6">
          <ClassroomDescriptorWrapper classroomArr={classrooms} />
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <p className="pb-8 text-lg font-medium">
            {translations('Classrooms.no-classrooms-found')}
          </p>
          <Image
            src="/undraw_no_data_re_kwbl.svg"
            alt="No data"
            width={200}
            height={200}
          />
        </div>
      )}
      {classrooms && classrooms.length > 0 && (
        <div className="my-16 flex items-center justify-center">
          <Image
            src="/undraw_online_learning_re_qw08.svg"
            alt="online_learning"
            width="384"
            height="276"
          />
        </div>
      )}
    </>
  );
}
