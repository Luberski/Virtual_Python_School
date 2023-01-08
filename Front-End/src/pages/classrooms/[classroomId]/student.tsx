import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import { Actions, WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';
import NavBar from '@app/components/NavBar';
import ClassroomCodeEditor from '@app/features/classroomCodeEditor/ClassroomCodeEditor';
import Button, { ButtonVariant } from '@app/components/Button';
import toast from 'react-hot-toast';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import Head from 'next/head';
import {
  fetchClassrooms,
  selectClassroomsData,
} from '@app/features/classrooms/classroomsSlice';
import {
  deleteClassroomSession,
  fetchClassroomSessions,
  selectClassroomSessionsData,
} from '@app/features/classrooms/sessions/classroomSessionsSlice';
import router from 'next/router';
import dynamic from 'next/dynamic';
import StyledDialog from '@app/components/StyledDialog';

const Toaster = dynamic(
  () => import('react-hot-toast').then((c) => c.Toaster),
  {
    ssr: false,
  }
);

type ClassroomsStudentPageProps = {
  classroomId: string;
};

export default function ClassroomsStudentPage(
  props: ClassroomsStudentPageProps
) {
  const [shouldRender, setShouldRender] = useState(true);
  const [isLeaveClassroomDialogOpen, setIsLeaveClassroomDialogOpen] =
    useState(false);
  const codeRef = useRef(null);
  const codeSyncAllowanceRef = useRef(null);
  const [isCodeSyncAllowed, setIsCodeSyncAllowed] = useState(false);
  const { classroomId } = props;
  const [user, isLoggedIn] = useAuthRedirect();
  const translations = useTranslations();
  const dispatch = useDispatch();
  const classrooms = useAppSelector(selectClassroomsData);
  const classroomSessionsData = useAppSelector(selectClassroomSessionsData);
  const [lastAction, setLastAction] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const validate = () => {
      if (!classrooms?.find((c) => c.id.toString() === classroomId)) {
        setShouldRender(false);
        notifyUnauthorized(translations('Classrooms.unauthorized'));
        setTimeout(() => {
          toast.dismiss();
          router.replace('/classrooms');
        }, 1000);
      }
      if (classroomSessionsData?.length > 0) {
        if (classroomSessionsData[0].is_teacher) {
          setShouldRender(false);
          router.replace(
            `/classrooms/${classroomSessionsData[0].classroom_id}/teacher`
          );
        }
      } else {
        setShouldRender(false);
        notifyUnauthorized(translations('Classrooms.unauthorized'));
        setTimeout(() => {
          toast.dismiss();
          router.replace('/classrooms');
        }, 1000);
      }
    };
    validate();
  }, []);

  const notifyClassroomDeleted = (i18msg: string) =>
    toast.custom(
      (to) => (
        <button
          type="button"
          className="brand-shadow rounded-lg border-indigo-500 bg-indigo-200 py-3 px-4 text-indigo-900 shadow-indigo-900/25"
          onClick={() => toast.dismiss(to.id)}>
          <div className="flex justify-center space-x-1">
            <InformationCircleIcon className="h-6 w-6" />
            <div>
              <p className="font-bold">{i18msg}</p>
            </div>
          </div>
        </button>
      ),
      {
        id: 'classroom-deleted-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  const notifyClassroomLeave = (i18msg: string) =>
    toast.custom(
      (to) => (
        <button
          type="button"
          className="brand-shadow rounded-lg border-indigo-500 bg-indigo-200 py-3 px-4 text-indigo-900 shadow-indigo-900/25"
          onClick={() => toast.dismiss(to.id)}>
          <div className="flex justify-center space-x-1">
            <InformationCircleIcon className="h-6 w-6" />
            <div>
              <p className="font-bold">{i18msg}</p>
            </div>
          </div>
        </button>
      ),
      {
        id: 'classroom-leave-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  const notifyConnectionFailed = (i18msg: string) =>
    toast.custom(
      (to) => (
        <button
          type="button"
          className="brand-shadow rounded-lg border-indigo-500 bg-indigo-200 py-3 px-4 text-indigo-900 shadow-indigo-900/25"
          onClick={() => toast.dismiss(to.id)}>
          <div className="flex justify-center space-x-1">
            <InformationCircleIcon className="h-6 w-6" />
            <div>
              <p className="font-bold">{i18msg}</p>
            </div>
          </div>
        </button>
      ),
      {
        id: 'classroom-connection-failed-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  const notifyUnauthorized = (i18msg: string) =>
    toast.custom(
      (to) => (
        <button
          type="button"
          className="brand-shadow rounded-lg border-indigo-500 bg-indigo-200 py-3 px-4 text-indigo-900 shadow-indigo-900/25"
          onClick={() => toast.dismiss(to.id)}>
          <div className="flex justify-center space-x-1">
            <InformationCircleIcon className="h-6 w-6" />
            <div>
              <p className="font-bold">{i18msg}</p>
            </div>
          </div>
        </button>
      ),
      {
        id: 'classroom-unathorized-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  const onClassroomLeaveSubmit = async () => {
    try {
      await dispatch(deleteClassroomSession())
        .unwrap()
        .then((result) => {
          if (result.data.id.toString() === classroomId) {
            // Send message to all students that the classroom has been deleted
            socketRef.current.send(
              JSON.stringify({
                action: Actions.CLASSROOM_DELETED,
                classroomId: classroomId,
                value: null,
              })
            );
          }
          notifyClassroomLeave(
            translations('Classrooms.leave-success')
          );
          setTimeout(() => {
            toast.dismiss();
            router.replace('/classrooms');
          }, 1000);
        });
    } catch (error) {
      console.error(error);
    }
    closeLeaveClassroomDialog();
  };

  const closeLeaveClassroomDialog = () => {
    setIsLeaveClassroomDialogOpen(false);
  };
  const openLeaveClassroomDialog = () => {
    setIsLeaveClassroomDialogOpen(true);
  };

  const submitCode = async () => {
    socketRef.current.send(
      JSON.stringify({
        action: Actions.CODE_SUBMITTED,
        value: user.username,
      })
    );
  };

  useEffect(() => {
    const onMessage = (ev: { data: string }) => {
      const recv = JSON.parse(ev.data);
      if (recv.action === Actions.CODE_CHANGE) {
        codeRef.current = recv.value;
      } else if (recv.action === Actions.GET_CODE) {
        socketRef.current.send(
          JSON.stringify({
            action: Actions.GET_CODE_RESPONSE,
            value: codeRef.current,
          })
        );
      } else if (recv.action === Actions.LOCK_CODE) {
        setIsCodeSyncAllowed(false);
      } else if (recv.action === Actions.UNLOCK_CODE) {
        setIsCodeSyncAllowed(true);
        setLastAction(Actions.CODE_CHANGE);
      } else if (recv.action === Actions.CLASSROOM_DELETED) {
        notifyClassroomDeleted(
          translations('Classrooms.classroom-deleted-student')
        );
        setTimeout(() => {
          toast.dismiss();
          socketRef.current.close();
          router.replace('/classrooms');
        }, 1000);
      }
      setLastAction(parseInt(recv.action));
    };

    const createSocket = async () => {
      const connectNotification = toast.loading(
        translations('Classrooms.connecting')
      );
      const ws = new WebSocket(`ws://localhost:5000/ws/${classroomId}`);
      ws.onmessage = onMessage;
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            action: Actions.JOIN,
            value: user.username,
          })
        );

        toast.success(translations('Classrooms.connected'), {
          id: connectNotification,
        });
      };
      ws.onclose = () => {
        console.error('Connection closed');
      };
      ws.onerror = (error) => {
        console.error(error);
        notifyConnectionFailed(translations('Classrooms.connection-failed'));
      };
      return ws;
    };

    const init = async () => {
      codeRef.current = "print('Hello World')";
      setLastAction(Actions.NONE);
      const ws = await createSocket();
      socketRef.current = ws;
      codeSyncAllowanceRef.current = false;
    };

    if (shouldRender) {
      init();
    }

    return () => {
      if (shouldRender) socketRef.current.close();
    };
  }, [shouldRender]);

  return (
    <>
      <div>
        <Toaster position="top-center" reverseOrder={false} />
      </div>
      <Head>
        <title>
          {translations('Meta.title-classrooms')} - {WEBSITE_TITLE}
        </title>
      </Head>
      <div className="flex h-screen w-full flex-col">
        <NavBar
          user={user}
          isLoggedIn={isLoggedIn}
          logout={() =>
            dispatch({
              type: 'auth/logout',
            })
          }
        />
        <div className="flex h-full flex-1 flex-row">
          <div className="flex w-1/6 flex-1 flex-col justify-between border-r-2 border-neutral-50 bg-white p-6 dark:border-neutral-900 dark:bg-neutral-800">
            <div className="flex flex-col justify-start align-middle">
              <h1 className="mb-4 text-center text-2xl font-bold">
                {translations('Classrooms.users')}
              </h1>
            </div>
            <Button
              variant={ButtonVariant.DANGER}
              type="button"
              onClick={openLeaveClassroomDialog}>
              {translations('Classrooms.leave-classroom')}
            </Button>

            <StyledDialog
              title={translations('Classrooms.leave-popup-title')}
              isOpen={isLeaveClassroomDialogOpen}
              onClose={closeLeaveClassroomDialog}>
              <div className="py-6">
                <div className="mt-6 flex flex-row items-center justify-center">
                  <Button
                    onClick={closeLeaveClassroomDialog}
                    className="mr-2"
                    variant={ButtonVariant.PRIMARY}>
                    {translations('Classrooms.cancel')}
                  </Button>
                  <Button
                    type="button"
                    variant={ButtonVariant.DANGER}
                    onClick={onClassroomLeaveSubmit}>
                    {translations('Classrooms.leave')}
                  </Button>
                </div>
              </div>
            </StyledDialog>
          </div>

          <div className="flex w-5/6 flex-col bg-white dark:bg-neutral-800">
            <div className="flex h-16 flex-row items-center justify-between border-b-2 border-neutral-50 p-4 dark:border-neutral-900">
              <Button variant={ButtonVariant.FLAT_SECONDARY} disabled>
                {translations('Classrooms.run')}
              </Button>
              <Button
                variant={ButtonVariant.FLAT_SECONDARY}
                disabled={!isCodeSyncAllowed}
                onClick={submitCode}>
                {translations('Classrooms.submit')}
              </Button>
            </div>
            <div className="w-full">
              <ClassroomCodeEditor
                socketRef={socketRef}
                roomId={classroomId}
                codeSyncAllowanceRef={codeSyncAllowanceRef}
                isEditable={isCodeSyncAllowed}
                onCodeChange={(code) => {
                  codeRef.current = code;
                }}
                lastAction={lastAction}
                setLastAction={setLastAction}
                codeRef={codeRef}
                user={user}
              />
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
      await store.dispatch(fetchClassrooms(true));
      await store.dispatch(fetchClassroomSessions());

      const { classroomId } = params as {
        classroomId: string;
      };

      return {
        props: {
          classroomId,
          i18n: Object.assign(
            {},
            await import(`../../../../i18n/${locale}.json`)
          ),
        },
      };
    }
);
