import React, { useState, useEffect, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import { Actions, ViewMode, WEBSITE_TITLE } from '@app/constants';
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
  notifyUserLeft,
} from '@app/notifications';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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
  const socketUrl = `ws://localhost:5000/ws/${classroomId}`;
  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebSocket(socketUrl);

  const codeRef = useRef(null);
  const myCodeRef = useRef('print("Hello World")');
  const connectNotification = useRef(null);

  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [teacher, setTeacher] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [mode, setMode] = useState(null);
  const [messageHandled, setMessageHandled] = useState(true);

  const [isLeaveClassroomDialogOpen, setIsLeaveClassroomDialogOpen] =
    useState(false);
  const [isAssignmentsMenuOpen, setIsAssignmentsMenuOpen] = useState(false);

  const closeLeaveClassroomDialog = () => {
    setIsLeaveClassroomDialogOpen(false);
  };
  const openLeaveClassroomDialog = () => {
    setIsLeaveClassroomDialogOpen(true);
  };
  const handleAssignmentsMenu = () => {
    setIsAssignmentsMenuOpen(!isAssignmentsMenuOpen);
  };

  useEffect(() => {
    const validate = () => {
      if (!classrooms?.find((c) => c.id.toString() === classroomId)) {
        notifyUnauthorized(translations('Classrooms.unauthorized'));
        setTimeout(() => {
          toast.dismiss();
          router.replace('/');
        }, 1000);
      }
      if (classroomSessionsData?.length > 0) {
        if (classroomSessionsData[0].is_teacher) {
          router.replace(
            `/classrooms/${classroomSessionsData[0].classroom_id}/teacher`
          );
        }
      } else {
        notifyUnauthorized(translations('Classrooms.unauthorized'));
        setTimeout(() => {
          toast.dismiss();
          router.replace('/');
        }, 1000);
      }
    };
    validate();
  }, [classroomId, classroomSessionsData, classrooms, translations]);

  const onClassroomLeaveSubmit = async () => {
    try {
      await dispatch(deleteClassroomSession())
        .unwrap()
        .then((result) => {
          if (result.data.id.toString() === classroomId) {
            sendJsonMessage({
              action: Actions.LEAVE,
              user_id: user.username,
              data: null,
            });
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

  useEffect(() => {
    switch (readyState) {
      case ReadyState.OPEN:
        sendJsonMessage({
          action: Actions.JOIN,
          user_id: user.username,
          data: null,
        });
        toast.success(translations('Classrooms.connected'), {
          id: connectNotification.current,
        });
        setMode(ViewMode.PersonalWhiteboard);
        break;

      case ReadyState.CLOSED:
        console.error('Connection closed');
        break;

      case ReadyState.CONNECTING:
        connectNotification.current = toast.loading(
          translations('Classrooms.connecting')
        );
        break;
    }
  }, [readyState, sendJsonMessage, translations, user.username]);

  useEffect(() => {
    const getSharedWhiteboardCode = async () => {
      sendJsonMessage({
        action: Actions.GET_DATA,
        user_id: user.username,
        data: {
          whiteboard_type: 'public',
        },
      });
    };

    const getPersonalAssignment = async (assignment_name: string) => {
      sendJsonMessage({
        action: Actions.GET_DATA,
        user_id: user.username,
        data: {
          assignment_name: assignment_name,
          whiteboard_type: 'assignment',
        },
      });
    };

    const getPersonalWhiteboard = async () => {
      sendJsonMessage({
        action: Actions.GET_DATA,
        user_id: user.username,
        data: {
          whiteboard_type: 'private',
        },
      });
    };

    if (mode !== null) {
      switch (mode) {
        case ViewMode.SharedWhiteboard:
          if (selectedAssignment !== '') {
            setSelectedAssignment('');
          } else {
            getSharedWhiteboardCode();
          }
          break;
        case ViewMode.PersonalWhiteboard:
          if (selectedAssignment !== '') {
            setSelectedAssignment('');
          } else {
            getPersonalWhiteboard();
          }
          break;
        case ViewMode.Assignment:
          if (selectedAssignment !== '') {
            getPersonalAssignment(selectedAssignment);
          }
          break;
        default:
          break;
      }
    }
  }, [mode, selectedAssignment, sendJsonMessage, user.username]);

  useEffect(() => {
    if (lastJsonMessage) {
      setMessageHandled(false);
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (!messageHandled && lastJsonMessage != null) {
      switch (lastJsonMessage.action) {
        case Actions.SYNC_DATA:
          setUsers(
            lastJsonMessage.data.users.find((u) => u.user_id !== user.username)
          );
          setTeacher(lastJsonMessage.data.teacher);
          setIsEditable(lastJsonMessage.data.is_editable);
          myCodeRef.current = lastJsonMessage.data.personal_whiteboard;
          codeRef.current = lastJsonMessage.data.shared_whiteboard;
          setAssignments(lastJsonMessage.data.assignments);
          break;

        case Actions.JOIN:
          setUsers((users) => [...users, lastJsonMessage.data.user_id]);
          break;

        case Actions.LEAVE:
          if (lastJsonMessage.data.user_id !== teacher) {
            setUsers(
              users.filter((user) => user !== lastJsonMessage.data.user_id)
            );

            notifyUserLeft(
              lastJsonMessage.data.user_id +
                ' ' +
                translations('Classrooms.student-left')
            );
          }
          break;

        case Actions.CODE_CHANGE:
          if (lastJsonMessage.data.whiteboard.whiteboard_type === 'public') {
            codeRef.current = lastJsonMessage.data.code;
          } else if (
            lastJsonMessage.data.whiteboard.whiteboard_type === 'private' &&
            lastJsonMessage.data.user_id === teacher &&
            mode === ViewMode.PersonalWhiteboard
          ) {
            myCodeRef.current = lastJsonMessage.data.code;
          } else if (
            lastJsonMessage.data.whiteboard.whiteboard_type === 'assignment'
          ) {
            if (
              selectedAssignment ===
                lastJsonMessage.data.assignment.assignment_name &&
              mode === ViewMode.Assignment
            ) {
              myCodeRef.current = lastJsonMessage.data.whiteboard.code;
            }
          }
          break;

        case Actions.GET_DATA:
          if (
            lastJsonMessage.data.whiteboard_type === 'public' &&
            mode === ViewMode.SharedWhiteboard
          ) {
            codeRef.current = lastJsonMessage.data.code;
          } else if (
            lastJsonMessage.data.whiteboard_type === 'private' &&
            mode === ViewMode.PersonalWhiteboard
          ) {
            myCodeRef.current = lastJsonMessage.data.code;
          } else if (
            lastJsonMessage.data.whiteboard_type === 'assignment' &&
            mode === ViewMode.Assignment
          ) {
            myCodeRef.current =
              lastJsonMessage.data.user_assignment.whiteboard.code;
          }
          break;

        case Actions.ASSIGNMENT_CREATE:
          setAssignments((assignments) => [
            ...assignments,
            lastJsonMessage.data,
          ]);
          break;

        case Actions.LOCK_CODE:
          setIsEditable(false);
          break;

        case Actions.UNLOCK_CODE:
          setIsEditable(true);
          break;
      }

      setLastAction(parseInt(lastJsonMessage.action));
      setMessageHandled(true);
    }
  }, [
    assignments,
    lastJsonMessage,
    messageHandled,
    mode,
    selectedAssignment,
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
                  setMode(ViewMode.SharedWhiteboard);
                }}
                disabled={mode === ViewMode.SharedWhiteboard}
                variant={ButtonVariant.PRIMARY}>
                {translations('Classrooms.shared-whiteboard')} - {teacher}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setMode(ViewMode.PersonalWhiteboard);
                }}
                disabled={mode === ViewMode.PersonalWhiteboard}
                variant={ButtonVariant.PRIMARY}>
                {translations('Classrooms.my-whiteboard')}
              </Button>
              {users?.length > 0 && users?.map((u) => <div key={u}>{u}</div>)}
              <h1 className="mb-4 text-center text-2xl font-bold">
                {translations('Classrooms.my-assignments')}
              </h1>
              <Button
                type="button"
                variant={ButtonVariant.FLAT_SECONDARY}
                onClick={handleAssignmentsMenu}>
                <div className="flex flex-row items-center justify-center gap-2">
                  {isAssignmentsMenuOpen ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                  {translations('Classrooms.assignments')}
                </div>
              </Button>
              {assignments?.length > 0 &&
                isAssignmentsMenuOpen &&
                assignments.map((a) => (
                  <Button
                    key={a.assignment.assignment_name}
                    type="button"
                    onClick={() => {
                      setSelectedAssignment(a.assignment.assignment_name);
                      setMode(ViewMode.Assignment);
                    }}
                    disabled={
                      selectedAssignment === a.assignment.assignment_name &&
                      mode === ViewMode.Assignment
                    }
                    variant={ButtonVariant.PRIMARY}>
                    {a.assignment.assignment_name}
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
              {mode === ViewMode.Assignment && (
                <Button variant={ButtonVariant.FLAT_SECONDARY} disabled>
                  {translations('Classrooms.send-to-review')}
                </Button>
              )}
            </div>
            <div className="w-full">
              {mode === ViewMode.PersonalWhiteboard ||
              mode === ViewMode.Assignment ? (
                <ClassroomCodeEditor
                  connState={readyState}
                  sendMsg={sendJsonMessage}
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
                  assignmentName={selectedAssignment ? selectedAssignment : ''}
                  mode={mode}
                />
              ) : (
                <ClassroomCodeEditor
                  connState={readyState}
                  sendMsg={sendJsonMessage}
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
                  mode={mode}
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
