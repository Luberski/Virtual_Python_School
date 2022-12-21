import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';
import { useAuthRedirect } from '@app/hooks';
import { Actions } from '@app/constants';
import { wrapper } from '@app/store';
import NavBar from '@app/components/NavBar';
import ClassroomCodeEditor from '@app/features/classroomCodeEditor/ClassroomCodeEditor';
import Button, { ButtonVariant } from '@app/components/Button';
import toast from 'react-hot-toast';
import FancyToast from '@app/components/FancyToast';

export default function ClassroomsPage(props: {
  classroomId: string;
  i18n: unknown;
}) {
  const codeRef = useRef(null);
  const codeSyncAllowanceRef = useRef(true);
  const { classroomId } = props;
  const [user, isLoggedIn] = useAuthRedirect();
  const t = useTranslations();
  const dispatch = useDispatch();

  const [lastAction, setLastAction] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersSubmitted, setUsersSubmitted] = useState([]);
  const [isCodeSyncAllowed, setIsCodeSyncAllowed] = useState(true);
  const socketRef = useRef(null);

  const notify = (message: string) =>
    toast.custom(
      (to) =>
        to.visible && (
          <FancyToast
            message={message}
            toastObject={to}
            className="border-indigo-500 bg-indigo-200 text-indigo-900"
          />
        ),
      {
        id: 'classroom-message',
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

  useEffect(() => {
    codeSyncAllowanceRef.current = isCodeSyncAllowed;
  }, [isCodeSyncAllowed]);

  useEffect(() => {
    const onMessage = (ev: { data: string }) => {
      const recv = JSON.parse(ev.data);
      if (recv.action === Actions.JOINED && codeRef.current) {
        setUsers((users) => [...users, recv.value]);
      } else if (recv.action === Actions.CODE_CHANGE) {
        codeRef.current = recv.value;
      } else if (recv.action === Actions.LEAVE) {
        setUsers((users) => users.filter((u) => u !== recv.value));
      } else if (recv.action === Actions.CODE_SUBMITTED) {
        setUsersSubmitted((usersSubmitted) => [...usersSubmitted, recv.value]);
      } else if (recv.action === Actions.GET_CODE_RESPONSE) {
        codeRef.current = recv.value;
        setIsCodeSyncAllowed(false);
        setUsersSubmitted([]);
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
        notify('Connection closed');
      };
      ws.onerror = (error) => {
        console.error(error);
      };
      return ws;
    };

    const init = async () => {
      const ws = await createSocket();
      socketRef.current = ws;
      codeSyncAllowanceRef.current = true;
      notify('Connected');
    };

    init();

    return () => {
      socketRef.current.close();
    };
  }, [classroomId, user.name, user.username]);

  return (
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
      <div className="flex h-screen w-full flex-row">
        <div className="flex h-full w-1/6 flex-col border-r-2 border-neutral-50 bg-white p-6 dark:border-neutral-900 dark:bg-neutral-800">
          <h1 className="mb-4 text-center text-2xl font-bold">Users</h1>
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

        <div className="flex w-5/6 flex-col bg-white dark:bg-neutral-800">
          <div className="flex h-16 w-full flex-row items-center justify-between border-b-2 border-neutral-50 p-4 dark:border-neutral-900">
            <Button variant={ButtonVariant.FLAT_SECONDARY} disabled>
              Run
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
                Lock editing
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
                Allow editing
              </Button>
            )}
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
              translations={t}
              user={user}
            />
          </div>
        </div>
      </div>
    </div>
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
