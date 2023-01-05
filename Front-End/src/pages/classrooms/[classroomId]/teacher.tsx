import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import { Actions, WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';
import NavBar from '@app/components/NavBar';
import ClassroomCodeEditor from '@app/features/classroomCodeEditor/ClassroomCodeEditor';
import Button, { ButtonVariant } from '@app/components/Button';
import toast, { Toaster } from 'react-hot-toast';
import {
  deleteClassroom,
  selectClassroomsStatus,
} from '@app/features/classrooms/classroomsSlice';
import StyledDialog from '@app/components/StyledDialog';
import Head from 'next/head';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

type ClassroomTeacherPageProps = {
  classroomId: string;
};

export default function ClassroomsTeacherPage({
  classroomId,
}: ClassroomTeacherPageProps) {
  const [isDeleteClassroomDialogOpen, setIsDeleteClassroomDialogOpen] =
    useState(false);
  const classroomStatus = useAppSelector(selectClassroomsStatus);
  const codeRef = useRef(null);
  const codeSyncAllowanceRef = useRef(true);
  const [user, isLoggedIn] = useAuthRedirect();
  const translations = useTranslations();
  const dispatch = useDispatch();

  const [lastAction, setLastAction] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersSubmitted, setUsersSubmitted] = useState([]);
  const [isCodeSyncAllowed, setIsCodeSyncAllowed] = useState(true);
  const socketRef = useRef(null);

  const notifyUserJoined = (i18msg: string) =>
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
        id: 'classroom-user-joined-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  const notifyUserLeft = (i18msg: string) =>
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
        id: 'classroom-user-left-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  const notifyConnected = (i18msg: string) =>
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
        id: 'classroom-connected-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  const notifyDisconnected = (i18msg: string) =>
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
        id: 'classroom-disconnected-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

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

  const onClassroomDeleteSubmit = async () => {
    try {
      await dispatch(deleteClassroom(parseInt(classroomId)))
        .unwrap()
        .then((result) => {
          if (result.data.id.toString() === classroomId) {
            notifyClassroomDeleted(
              translations('Classrooms.classroom-deleted')
            );
            // Send message to all students that the classroom has been deleted
            socketRef.current.send(
              JSON.stringify({
                action: Actions.CLASSROOM_DELETED,
                classroomId: classroomId,
                value: null,
              })
            );

            socketRef.current.close();
            window.location.href = '/classrooms';
          }
        });
    } catch (error) {
      console.error(error);
    }
  };

  const closeDeleteClassroomDialog = () => {
    setIsDeleteClassroomDialogOpen(false);
  };
  const openDeleteClassroomDialog = () => {
    setIsDeleteClassroomDialogOpen(true);
  };

  const get_user_code = async (student: string) => {
    socketRef.current.send(
      JSON.stringify({
        action: Actions.GET_CODE,
        value: student,
        teacher: user.username,
      })
    );
  };

  useEffect(() => {
    codeSyncAllowanceRef.current = isCodeSyncAllowed;
  }, [isCodeSyncAllowed]);

  useEffect(() => {
    const onMessage = (ev: { data: string }) => {
      const recv = JSON.parse(ev.data);
      if (recv.action === Actions.JOINED && codeRef.current) {
        setUsers((users) => [...users, recv.value]);
        notifyUserJoined(
          recv.value + ' ' + translations('Classrooms.student-joined')
        );
      } else if (recv.action === Actions.CODE_CHANGE) {
        codeRef.current = recv.value;
      } else if (recv.action === Actions.LEAVE) {
        notifyUserLeft(
          recv.value + ' ' + translations('Classrooms.student-left')
        );
        setUsers((users) => users.filter((u) => u !== recv.value));
      } else if (recv.action === Actions.CODE_SUBMITTED) {
        setUsersSubmitted((usersSubmitted) => [...usersSubmitted, recv.value]);
      } else if (recv.action === Actions.GET_CODE_RESPONSE) {
        codeRef.current = recv.value;
        setIsCodeSyncAllowed(false);
        setUsersSubmitted([]);
      } else if (recv.action === Actions.SYNC_USERS) {
        setUsers(recv.value.filter((u) => u !== null));
      }

      setLastAction(parseInt(recv.action));
    };
    codeRef.current = "print('Hello World')";
    setLastAction(Actions.NONE);
    const createSocket = async () => {
      const ws = new WebSocket(`ws://localhost:5000/ws/${classroomId}`);
      ws.onmessage = onMessage;
      ws.onopen = () => {
        socketRef.current.send(
          JSON.stringify({
            action: Actions.TEACHER_JOIN,
            value: user.username,
          })
        );
      };
      ws.onclose = () => {
        notifyDisconnected(translations('Classrooms.disconnected'));
      };
      ws.onerror = (error) => {
        console.error(error);
      };
      return ws;
    };

    const init = async () => {
      // TODO: Check if the classroom exists -> if not, redirect to 404
      // TODO: Check if the user is the teacher of the classroom -> if not, redirect to 404

      const ws = await createSocket();
      socketRef.current = ws;
      codeSyncAllowanceRef.current = true;
      notifyConnected(translations('Classrooms.connected'));
    };

    init();

    return () => {
      socketRef.current.close();
    };
  }, [classroomId, user.name, user.username]);

  return (
    <>
      <div>
        <Toaster position="top-center" reverseOrder={false} />
      </div>
      <Head>
        <title>
          {translations('Meta.title-courses')} - {WEBSITE_TITLE}
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
              {users.map((u) => (
                <Button
                  key={u}
                  onClick={() => {
                    get_user_code(u);
                  }}
                  type="button"
                  variant={ButtonVariant.PRIMARY}
                  disabled={!usersSubmitted.includes(u)}>
                  {u}
                </Button>
              ))}
            </div>
            <Button
              variant={ButtonVariant.DANGER}
              type="button"
              onClick={openDeleteClassroomDialog}>
              {translations('Classrooms.delete-classroom')}
            </Button>

            <StyledDialog
              title={translations('Classrooms.delete-popup-title')}
              isOpen={isDeleteClassroomDialogOpen}
              onClose={closeDeleteClassroomDialog}>
              <div className="py-6">
                <div className="mt-6 flex flex-row items-center justify-center">
                  <Button
                    onClick={closeDeleteClassroomDialog}
                    className="mr-2"
                    variant={ButtonVariant.PRIMARY}>
                    {translations('Classrooms.cancel')}
                  </Button>
                  <Button
                    type="button"
                    variant={ButtonVariant.DANGER}
                    onClick={onClassroomDeleteSubmit}>
                    {translations('Classrooms.delete')}
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
              {!isCodeSyncAllowed ? (
                <Button
                  variant={ButtonVariant.FLAT_SECONDARY}
                  onClick={() => {
                    setIsCodeSyncAllowed(true);

                    socketRef.current.send(
                      JSON.stringify({
                        action: Actions.LOCK_CODE,
                        value: user.username,
                      })
                    );
                  }}>
                  {translations('Classrooms.lock-editing')}
                </Button>
              ) : (
                <Button
                  variant={ButtonVariant.FLAT_SECONDARY}
                  onClick={() => {
                    setIsCodeSyncAllowed(false);
                    socketRef.current.send(
                      JSON.stringify({
                        action: Actions.UNLOCK_CODE,
                        value: user.username,
                      })
                    );
                  }}>
                  {translations('Classrooms.allow-editing')}
                </Button>
              )}
            </div>
            <div>
              <ClassroomCodeEditor
                socketRef={socketRef}
                roomId={classroomId}
                codeSyncAllowanceRef={codeSyncAllowanceRef}
                onCodeChange={(code) => {
                  codeRef.current = code;
                }}
                lastAction={lastAction}
                setLastAction={setLastAction}
                codeRef={codeRef}
                translations={translations}
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
  () =>
    async ({ locale, params }) => {
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
