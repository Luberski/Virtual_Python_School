import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';
import { useAuthRedirect } from '@app/hooks';
import { Actions, WEBSITE_TITLE } from '@app/constants';
import { store, wrapper } from '@app/store';
import NavBar from '@app/components/NavBar';
import ClassroomCodeEditor from '@app/features/classroomCodeEditor/ClassroomCodeEditor';
import Button, { ButtonVariant } from '@app/components/Button';
import toast, { Toaster } from 'react-hot-toast';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import Head from 'next/head';

type ClassroomsStudentPageProps = {
  classroomId: string;
};

export default function ClassroomsStudentPage(
  props: ClassroomsStudentPageProps
) {
  const codeRef = useRef(null);
  const codeSyncAllowanceRef = useRef(null);
  const [isCodeSyncAllowed, setIsCodeSyncAllowed] = useState(false);
  const { classroomId } = props;
  const [user, isLoggedIn] = useAuthRedirect();
  const translations = useTranslations();
  const dispatch = useDispatch();

  const [lastAction, setLastAction] = useState(null);
  const [users, setUsers] = useState([]);
  const socketRef = useRef(null);

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

  const get_user_code = async (student: string) => {
    socketRef.current.send(
      JSON.stringify({
        action: Actions.GET_CODE,
        value: student,
        teacher: user.username,
      })
    );
  };

  const submit_code = async () => {
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
      } else if (recv.action === Actions.LEAVE) {
        setUsers((users) => users.filter((u) => u !== recv.value));
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
        notifyClassroomDeleted(translations('Classrooms.classroom-deleted-student'));
        socketRef.current.close();
        window.location.href = '/classrooms';
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
            action: Actions.JOIN,
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
      // TODO: Check if the user is a student -> if not, redirect to 404 or if the user is a teacher -> redirect to the teacher page

      const ws = await createSocket();
      socketRef.current = ws;
      codeSyncAllowanceRef.current = false;
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
            <h1 className="mb-4 text-center text-2xl font-bold">Users</h1>
            {users.map((u) => (
              <Button
                key={u}
                onClick={() => {
                  get_user_code(u);
                }}
                type="button"
                variant={ButtonVariant.PRIMARY}>
                {u}
              </Button>
            ))}
          </div>

          <div className="flex w-5/6 flex-col bg-white dark:bg-neutral-800">
            <div className="flex h-16 flex-row items-center justify-between border-b-2 border-neutral-50 p-4 dark:border-neutral-900">
              <Button variant={ButtonVariant.FLAT_SECONDARY} disabled>
                {translations('Classrooms.run')}
              </Button>
              <Button
                variant={ButtonVariant.FLAT_SECONDARY}
                disabled={!isCodeSyncAllowed}
                onClick={submit_code}>
                {translations('Classrooms.submit')}
              </Button>
            </div>
            <div className="w-full">
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
