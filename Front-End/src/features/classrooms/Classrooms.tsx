import Image from 'next/image';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import StyledDialog from '@app/components/StyledDialog';
import ClassroomDescriptorWrapper from '@app/components/ClassroomDescriptorWrapper';
import type Classroom from '@app/models/Classroom';
import {
  createClassroom,
  selectClassroomsData,
  selectClassroomsStatus,
} from '@app/features/classrooms/classroomsSlice';
import {
  fetchClassroomSessions,
  selectClassroomSessionsData,
} from '@app/features/classrooms/sessions/classroomSessionsSlice';
import Checkbox from '@app/components/Checkbox';
import Button, { ButtonVariant } from '@app/components/Button';
import Input from '@app/components/Input';
import { useAppSelector } from '@app/hooks';

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

  const router = useRouter();
  const dispatch = useDispatch();

  const classroomData = useAppSelector(selectClassroomsData);
  const classroomStatus = useAppSelector(selectClassroomsStatus);
  const classroomSessionsData = useAppSelector(selectClassroomSessionsData);

  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectId, setRedirectId] = useState(0);

  useEffect(() => {
    fetchSessions().catch(console.error);
  }, []);

  useEffect(() => {
    if (
      (shouldRedirect &&
        classroomStatus === 'succeeded' &&
        classroomData?.length > 0) ||
      (classroomSessionsData?.length > 0 && shouldRedirect)
    ) {
      // TODO: Rewrite classroomSessionsData to return a single object instead of an array
      if (classroomSessionsData[0].is_teacher) {
        router.push(`/classrooms/${redirectId}/teacher`);
      } else {
        router.push(`/classrooms/${redirectId}/student`);
      }
    }
  }, [
    shouldRedirect,
    classroomStatus,
    classroomData,
    router,
    classroomSessionsData,
    redirectId,
  ]);

  const { register, handleSubmit, setValue } =
    useForm<{
      name: string;
      is_public: boolean;
    }>();

  const cancelButtonRef = useRef(null);

  const closeCreateClassroomDialog = () => {
    setIsCreateClassroomDialogOpen(false);
  };
  const openCreateClassroomDialog = () => {
    setIsCreateClassroomDialogOpen(true);
  };
  const redirectToClassroom = (id: number) => {
    if (id) {
      setRedirectId(id);
      setShouldRedirect(true);
    }
  };

  const onClassroomCreateSubmit = async (data: {
    name: string;
    is_public: boolean;
  }) => {
    const { name, is_public } = data;
    setValue('name', '');
    setValue('is_public', false);

    try {
      await dispatch(createClassroom({ name, is_public }))
        .unwrap()
        .then((result) => {
          if (result.data) {
            redirectToClassroom(result.data.id);
          }
        });
    } catch (error) {
      console.error(error);
    }
    closeCreateClassroomDialog();
  };

  const fetchSessions = async () => {
    await dispatch(fetchClassroomSessions())
      .unwrap()
      .then((result) => {
        if (result.data.length > 0) {
          redirectToClassroom(result.data[0].classroom_id);
        }
      });
  };

  return (
    <>
      <div className="mb-12 flex h-full flex-row items-center justify-center space-x-6">
        <Button
          variant={ButtonVariant.PRIMARY}
          type="button"
          onClick={openCreateClassroomDialog}
          ref={cancelButtonRef}>
          {translations('Classrooms.create-new')}
        </Button>

        <StyledDialog
          title={translations('Classrooms.create-new')}
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
