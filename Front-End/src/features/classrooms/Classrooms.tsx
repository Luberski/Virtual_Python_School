import Image from 'next/image';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import StyledDialog from '@app/components/StyledDialog';
import ClassroomDescriptorWrapper from '@app/components/ClassroomDescriptorWrapper';
import type Classroom from '@app/models/Classroom';
import {
  createClassroom,
  joinClassroomWithAccessCode,
} from '@app/features/classrooms/classroomsSlice';
import Checkbox from '@app/components/Checkbox';
import Button, { ButtonVariant } from '@app/components/Button';
import Input from '@app/components/Input';

type ClassroomsProps = {
  classrooms: Classroom[];
  translations: (key: string) => string;
};
export default function Classrooms({
  classrooms,
  translations,
}: ClassroomsProps) {
  const [isCreateClassroomDialogOpen, setIsCreateClassroomDialogOpen] =
    useState(false);
  const [isJoinWithAccessCodeDialogOpen, setIsJoinWithAccessCodeDialogOpen] =
    useState(false);

  const [checked, setChecked] = useState(true);

  const router = useRouter();
  const dispatch = useDispatch();

  const {
    register: registerClassroom,
    handleSubmit: handleClassroomSubmit,
    setValue: setClassroomValue,
  } = useForm<{
    name: string;
    is_public: boolean;
  }>();

  const {
    register: registerCodeJoin,
    handleSubmit: handleCodeJoinSubmit,
    setValue: setCodeJoinValue,
  } = useForm<{
    accessCode: string;
  }>();

  const cancelClassroomButtonRef = useRef(null);
  const cancelCodeJoinButtonRef = useRef(null);

  const closeCreateClassroomDialog = () => {
    setIsCreateClassroomDialogOpen(false);
  };
  const openCreateClassroomDialog = () => {
    setIsCreateClassroomDialogOpen(true);
  };

  const closeJoinWithAccessCodeDialog = () => {
    setIsJoinWithAccessCodeDialogOpen(false);
  };
  const openJoinWithAccessCodeDialog = () => {
    setIsJoinWithAccessCodeDialogOpen(true);
  };

  const onClassroomCreateSubmit = async (data: {
    name: string;
    is_public: boolean;
  }) => {
    const { name, is_public } = data;
    setClassroomValue('name', '');
    setClassroomValue('is_public', true);

    try {
      await dispatch(createClassroom({ name, is_public }))
        .unwrap()
        .then((result) => {
          if (result.data) {
            router.push(`/classrooms/${result.data.id}/teacher`);
          }
        });
    } catch (error) {
      console.error(error);
    }
    closeCreateClassroomDialog();
  };

  const onJoinWithAccessCodeSubmit = async (data: { accessCode: string }) => {
    const { accessCode } = data;
    setCodeJoinValue('accessCode', '');

    try {
      await dispatch(joinClassroomWithAccessCode(accessCode.trim()))
        .unwrap()
        .then((result) => {
          if (result.data) {
            router.push(`/classrooms/${result.data.id}/student`);
          }
        });
    } catch (error) {
      console.error(error);
    }
    closeJoinWithAccessCodeDialog();
  };

  return (
    <>
      <div className="mb-12 flex h-full flex-row items-center justify-center space-x-6">
        <Button
          variant={ButtonVariant.PRIMARY}
          type="button"
          onClick={openCreateClassroomDialog}
          ref={cancelClassroomButtonRef}>
          {translations('Classrooms.create-new')}
        </Button>

        <StyledDialog
          title={translations('Classrooms.create-new')}
          isOpen={isCreateClassroomDialogOpen}
          onClose={closeCreateClassroomDialog}>
          <div className="py-6">
            <form
              method="dialog"
              onSubmit={handleClassroomSubmit(onClassroomCreateSubmit)}>
              <div className="flex flex-col gap-y-2">
                <Input
                  label="name"
                  name="name"
                  type="text"
                  register={registerClassroom}
                  required
                  maxLength={50}
                  minLength={3}
                  placeholder={translations(
                    'Classrooms.classroom-name'
                  )}></Input>
                <div className="flex items-center">
                  <Checkbox
                    id="is_public"
                    label="is_public"
                    name="is_public"
                    checked={checked}
                    onChange={() => setChecked(!checked)}
                    register={registerClassroom}></Checkbox>
                  <label htmlFor="is_public" className="ml-2">
                    {translations('Classrooms.is-public-checkbox')}
                  </label>
                </div>
              </div>
              <div className="mt-6 flex flex-row items-center justify-end">
                <Button
                  onClick={closeCreateClassroomDialog}
                  className="mr-2"
                  variant={ButtonVariant.DANGER}>
                  {translations('Classrooms.cancel')}
                </Button>
                <Button type="submit" variant={ButtonVariant.PRIMARY}>
                  {translations('Classrooms.submit')}
                </Button>
              </div>
            </form>
          </div>
        </StyledDialog>

        <Button
          variant={ButtonVariant.PRIMARY}
          type="button"
          onClick={openJoinWithAccessCodeDialog}
          ref={cancelCodeJoinButtonRef}>
          {translations('Classrooms.join-with-access-code')}
        </Button>

        <StyledDialog
          title={translations('Classrooms.join-with-access-code')}
          isOpen={isJoinWithAccessCodeDialogOpen}
          onClose={closeJoinWithAccessCodeDialog}>
          <div className="py-6">
            <form
              method="dialog"
              onSubmit={handleCodeJoinSubmit(onJoinWithAccessCodeSubmit)}>
              <div className="flex flex-col gap-y-2">
                <Input
                  label="accessCode"
                  name="accessCode"
                  type="text"
                  register={registerCodeJoin}
                  required
                  minLength={8}
                  maxLength={8}
                  placeholder={translations('Classrooms.access-code')}></Input>
              </div>
              <div className="mt-6 flex flex-row items-center justify-end">
                <Button
                  onClick={closeJoinWithAccessCodeDialog}
                  className="mr-2"
                  variant={ButtonVariant.DANGER}>
                  {translations('Classrooms.cancel')}
                </Button>
                <Button type="submit" variant={ButtonVariant.PRIMARY}>
                  {translations('Classrooms.join')}
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
