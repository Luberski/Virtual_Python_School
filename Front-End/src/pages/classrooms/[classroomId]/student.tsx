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
import {
  notifyUnauthorized,
  notifyClassroomLeave,
  notifyConnectionFailed,
} from '@app/notifications';

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
  const [user, isLoggedIn] = useAuthRedirect();
  const translations = useTranslations();
  const dispatch = useDispatch();
  const classrooms = useAppSelector(selectClassroomsData);
  const classroomSessionsData = useAppSelector(selectClassroomSessionsData);
  const { classroomId } = props;

  const codeRef = useRef(null);
  const myCodeRef = useRef('print("Hello World")');
  const codeSyncAllowanceRef = useRef(null);
  const socketRef = useRef(null);

  const [assignments, setAssignments] = useState([]);
  const [currentAssignment, setCurrentAssignment] = useState('');
  const [codeChanged, setCodeChanged] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [validateError, setValidateError] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [isLeaveClassroomDialogOpen, setIsLeaveClassroomDialogOpen] =
    useState(false);
  const [isPersonalWhiteboardOpen, setIsPersonalWhiteboardOpen] =
    useState(false);
  const [users, setUsers] = useState([]);
  const [isEditable, setIsEditable] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  useEffect(() => {
    const validate = () => {
      if (!classrooms?.find((c) => c.id.toString() === classroomId)) {
        setValidateError(true);
        notifyUnauthorized(translations('Classrooms.unauthorized'));
        setTimeout(() => {
          toast.dismiss();
          router.replace('/classrooms');
        }, 1000);
      }
      if (classroomSessionsData?.length > 0) {
        if (classroomSessionsData[0].is_teacher) {
          setValidateError(true);
          router.replace(
            `/classrooms/${classroomSessionsData[0].classroom_id}/teacher`
          );
        }
      } else {
        setValidateError(true);
        notifyUnauthorized(translations('Classrooms.unauthorized'));
        setTimeout(() => {
          toast.dismiss();
          router.replace('/classrooms');
        }, 1000);
      }

      if (!validateError) {
        setShouldRender(true);
      }
    };
    validate();
  }, [
    classroomId,
    classroomSessionsData,
    classrooms,
    translations,
    validateError,
  ]);

  const onClassroomLeaveSubmit = async () => {
    try {
      await dispatch(deleteClassroomSession())
        .unwrap()
        .then((result) => {
          if (result.data.id.toString() === classroomId) {
            socketRef.current.send(
              JSON.stringify({
                action: Actions.LEAVE,
                user_id: user.username,
                data: null,
              })
            );
          }
          notifyClassroomLeave(translations('Classrooms.leave-success'));
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

  useEffect(() => {
    const setAssignmentCode = (assignmentName: string, code: string) => {
      const assignment = assignments.find(
        (assignment) => assignment.name === assignmentName
      );
      assignment.code = code;
      setAssignments([...assignments]);
    };

    const onMessage = (ev: { data: string }) => {
      const recv = JSON.parse(ev.data);

      switch (recv.action) {
        case Actions.SYNC_DATA:
          setUsers(recv.data.users.find((u) => u.user_id !== user.username));
          setTeacher(recv.data.teacher);
          setIsEditable(recv.data.is_editable);
          myCodeRef.current = recv.data.personal_whiteboard;
          codeRef.current = recv.data.shared_whiteboard;
          setAssignments(recv.data.assignments);
          break;

        case Actions.JOIN:
          setUsers((users) => [...users, recv.data.user_id]);
          break;

        case Actions.LEAVE:
          if (recv.data.user_id !== teacher) {
            setUsers(users.filter((u) => u !== recv.data.user_id));
          }
          break;

        case Actions.CODE_CHANGE:
          if (recv.data.whiteboard_type === 'public') {
            codeRef.current = recv.data.code;
          } else if (
            recv.data.whiteboard_type === 'private' &&
            recv.data.user_id === teacher
          ) {
            myCodeRef.current = recv.data.code;
          } else if (
            recv.data.whiteboard_type === 'assignment' &&
            recv.data.user_id !== teacher
          ) {
            setAssignmentCode(recv.data.assignment_name, recv.data.code);
            myCodeRef.current = recv.data.code;
          }
          break;

        case Actions.GET_DATA:
          if (
            recv.data.target_user === user.username &&
            recv.data.whiteboard_type === 'public'
          ) {
            codeRef.current = recv.data.code;
          } else if (
            recv.data.target_user === user.username &&
            recv.data.whiteboard_type === 'private'
          ) {
            myCodeRef.current = recv.data.code;
          } else if (
            recv.data.target_user === user.username &&
            recv.data.whiteboard_type === 'assignment'
          ) {
            setAssignmentCode(recv.data.assignment_name, recv.data.code);
            myCodeRef.current = recv.data.code;
          }
          break;

        case Actions.ASSIGNMENT_CREATE:
          setAssignments((assignments) => [...assignments, recv.data]);
          break;

        case Actions.LOCK_CODE:
          setIsEditable(false);
          break;

        case Actions.UNLOCK_CODE:
          setIsEditable(true);
          break;
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
            user_id: user.username,
            data: null,
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

    if (shouldRender && socketRef.current === null) {
      init();
    } else if (shouldRender && socketRef.current) {
      socketRef.current.onmessage = onMessage;
    }

    return () => {
      if (shouldRender && socketRef.current === null) socketRef.current.close();
    };
  }, [
    assignments,
    classroomId,
    shouldRender,
    teacher,
    translations,
    user.username,
    users,
  ]);

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
            <div className="flex flex-col justify-start gap-2 align-middle">
              <h1 className="mb-4 text-center text-2xl font-bold">
                {translations('Classrooms.whiteboards')}
              </h1>
              <Button
                type="button"
                onClick={() => {
                  setIsPersonalWhiteboardOpen(false);
                  setLastAction(Actions.CODE_CHANGE);
                }}
                disabled={!isPersonalWhiteboardOpen}
                variant={ButtonVariant.PRIMARY}>
                {translations('Classrooms.shared-whiteboard')} - {teacher}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsPersonalWhiteboardOpen(true);
                  setCurrentAssignment('');
                  setLastAction(Actions.CODE_CHANGE);
                }}
                disabled={isPersonalWhiteboardOpen && currentAssignment === ''}
                variant={ButtonVariant.PRIMARY}>
                {translations('Classrooms.my-whiteboard')}
              </Button>
              {users?.length > 0 && users?.map((u) => <div key={u}>{u}</div>)}
              <h1 className="mb-4 text-center text-2xl font-bold">
                {translations('Classrooms.my-assignments')}
              </h1>
              {assignments?.length > 0 &&
                assignments.map((a) => (
                  <Button
                    key={a.assignment_name}
                    type="button"
                    onClick={() => {
                      setCurrentAssignment(a.assignment_name);
                      setIsPersonalWhiteboardOpen(true);
                      setLastAction(Actions.CODE_CHANGE);
                    }}
                    disabled={
                      isPersonalWhiteboardOpen &&
                      currentAssignment === a.assignment_name
                    }
                    variant={ButtonVariant.PRIMARY}>
                    {a.assignment_name}
                  </Button>
                ))}
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
            </div>
            <div className="w-full">
              {isPersonalWhiteboardOpen ? (
                <ClassroomCodeEditor
                  socketRef={socketRef}
                  roomId={classroomId}
                  isEditable={true}
                  onCodeChange={(code) => {
                    myCodeRef.current = code;
                  }}
                  lastAction={lastAction}
                  setLastAction={setLastAction}
                  codeRef={myCodeRef}
                  user={user}
                  isTeacher={false}
                  personalWhiteboard={true}
                  assignmentName={currentAssignment ? currentAssignment : ''}
                />
              ) : (
                <ClassroomCodeEditor
                  socketRef={socketRef}
                  roomId={classroomId}
                  isEditable={isEditable}
                  onCodeChange={(code) => {
                    codeRef.current = code;
                  }}
                  lastAction={lastAction}
                  setLastAction={setLastAction}
                  codeRef={codeRef}
                  user={user}
                  isTeacher={false}
                />
              )}
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
