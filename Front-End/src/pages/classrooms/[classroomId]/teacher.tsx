import React, { useState, useEffect, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import { Actions, WEBSITE_TITLE, ViewMode } from '@app/constants';
import { wrapper } from '@app/store';
import NavBar from '@app/components/NavBar';
import ClassroomCodeEditor from '@app/features/classroomCodeEditor/ClassroomCodeEditor';
import Button, { ButtonVariant } from '@app/components/Button';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import {
  deleteClassroom,
  fetchClassrooms,
  selectClassroomsData,
} from '@app/features/classrooms/classroomsSlice';
import StyledDialog from '@app/components/StyledDialog';
import Head from 'next/head';
import {
  fetchClassroomSessions,
  selectClassroomSessionsData,
} from '@app/features/classrooms/sessions/classroomSessionsSlice';
import router from 'next/router';
import dynamic from 'next/dynamic';
import {
  notifyUnauthorized,
  notifyClassroomDeleted,
  notifyUserJoined,
  notifyUserLeft,
  notifyConnectionFailed,
  notifyAssignmentCreated,
} from '@app/notifications';
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import Input from '@app/components/Input';

const Toaster = dynamic(
  () => import('react-hot-toast').then((c) => c.Toaster),
  {
    ssr: false,
  }
);

type ClassroomTeacherPageProps = {
  classroomId: string;
};

export default function ClassroomsTeacherPage({
  classroomId,
}: ClassroomTeacherPageProps) {
  const { register, handleSubmit, setValue } =
    useForm<{
      assignment_name: string;
      assignment_description: string;
    }>();
  const [user, isLoggedIn] = useAuthRedirect();
  const translations = useTranslations();
  const classrooms = useAppSelector(selectClassroomsData);
  const classroomSessionsData = useAppSelector(selectClassroomSessionsData);
  const dispatch = useDispatch();
  const socketUrl = `ws://localhost:5000/ws/${classroomId}`;
  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebSocket(socketUrl);

  const codeRef = useRef('print("Hello World")');
  const myCodeRef = useRef('print("Hello World")');
  const connectNotification = useRef(null);

  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [isEditable, setIsEditable] = useState(false);
  const [mode, setMode] = useState(ViewMode.PersonalWhiteboard);
  const [lastAction, setLastAction] = useState(null);
  const [messageHandled, setMessageHandled] = useState(true);

  interface UserAssignment {
    id: string;
    isOpen: boolean;
  }

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  const [isAssignmentsMenuOpen, setIsAssignmentsMenuOpen] = useState(false);
  const [isAssignmentUsersDropdownOpen, setIsAssignmentUsersDropdownOpen] =
    useState<UserAssignment[] | undefined[]>([]);
  const [isDeleteClassroomDialogOpen, setIsDeleteClassroomDialogOpen] =
    useState(false);
  const [isCreateAssignmentDialogOpen, setIsCreateAssignmentDialogOpen] =
    useState(false);

  const closeDeleteClassroomDialog = () => {
    setIsDeleteClassroomDialogOpen(false);
  };

  const openDeleteClassroomDialog = () => {
    setIsDeleteClassroomDialogOpen(true);
  };

  const closeCreateAssignmentDialog = () => {
    setIsCreateAssignmentDialogOpen(false);
  };

  const openCreateAssignmentDialog = () => {
    setIsCreateAssignmentDialogOpen(true);
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
        if (classroomSessionsData[0].is_teacher === false) {
          notifyUnauthorized(translations('Classrooms.unauthorized'));
          setTimeout(() => {
            toast.dismiss();
            router.replace(
              `/classrooms/${classroomSessionsData[0].classroom_id}/student`
            );
          }, 1000);
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

  const handleAssignmentUsersDropdown = (id: string) => () => {
    const newAssignment = isAssignmentUsersDropdownOpen.find(
      (a) => a.id === id
    );
    newAssignment.isOpen = !newAssignment.isOpen;

    setIsAssignmentUsersDropdownOpen(
      isAssignmentUsersDropdownOpen.map((a) =>
        a.id === newAssignment.id ? newAssignment : a
      )
    );
  };

  const returnAssignmentUsersDropdownOpen = (id: string) => {
    const searchedAssignment = isAssignmentUsersDropdownOpen.filter(
      (a: { id: string; isOpen: boolean }) => a.id === id
    );
    return searchedAssignment.length > 0 ? searchedAssignment[0].isOpen : false;
  };

  useEffect(() => {
    switch (readyState) {
      case ReadyState.OPEN:
        sendJsonMessage({
          action: Actions.TEACHER_JOIN,
          user_id: user.username,
          data: null,
        });
        toast.success(translations('Classrooms.connected'), {
          id: connectNotification.current,
        });
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
    const getUserCode = async (student: string) => {
      sendJsonMessage({
        action: Actions.GET_DATA,
        user_id: user.username,
        data: {
          target_user: student,
          whiteboard_type: 'private',
        },
      });
    };

    const getUserAssignment = async (
      student: string,
      assignment_name: string
    ) => {
      sendJsonMessage({
        action: Actions.GET_DATA,
        user_id: user.username,
        data: {
          assignment_name: assignment_name,
          target_user: student,
          whiteboard_type: 'assignment',
        },
      });
    };

    switch (mode) {
      case ViewMode.PersonalWhiteboard:
        setSelectedAssignment('');
        setSelectedUser('');
        break;
      case ViewMode.ViewUserWhiteboard:
        if (selectedUser !== '') getUserCode(selectedUser);
        break;
      case ViewMode.Assignment:
        if (selectedUser !== '' && selectedAssignment !== '') {
          getUserAssignment(selectedUser, selectedAssignment);
        }
        break;
      default:
        break;
    }
  }, [mode, selectedAssignment, selectedUser, sendJsonMessage, user.username]);

  const onClassroomDeleteSubmit = async () => {
    try {
      await dispatch(deleteClassroom(parseInt(classroomId)))
        .unwrap()
        .then((result) => {
          if (result.data.id.toString() === classroomId) {
            // Send message to all students that the classroom has been deleted
            sendJsonMessage({
              action: Actions.CLASSROOM_DELETED,
              user_id: user.username,
              data: null,
            });
          }
          notifyClassroomDeleted(translations('Classrooms.classroom-deleted'));
          setTimeout(() => {
            toast.dismiss();
            router.replace('/classrooms');
          }, 1000);
        });
    } catch (error) {
      console.error(error);
    }
    closeDeleteClassroomDialog();
  };

  const onCreateAssignmentSubmit = (data: {
    assignment_name: string;
    assignment_description: string;
  }) => {
    const { assignment_name, assignment_description } = data;
    setValue('assignment_name', '');
    setValue('assignment_description', '');

    sendJsonMessage({
      action: Actions.ASSIGNMENT_CREATE,
      user_id: user.username,
      data: {
        assignment_name: assignment_name,
        assignment_description: assignment_description,
      },
    });
  };

  useEffect(() => {
    if (lastJsonMessage != null) {
      setMessageHandled(false);
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    let usersDropdown = [];
    if (!messageHandled && lastJsonMessage != null) {
      switch (lastJsonMessage.action) {
        case Actions.SYNC_DATA:
          setUsers(lastJsonMessage.data.users);
          setIsEditable(lastJsonMessage.data.is_editable);
          myCodeRef.current = lastJsonMessage.data.shared_whiteboard;
          setAssignments(lastJsonMessage.data.assignments);
          lastJsonMessage.data.assignments.map((a: Assignment) => {
            usersDropdown.push({
              id: a.assignment_id,
              isOpen: false,
            });
          });
          setIsAssignmentUsersDropdownOpen(usersDropdown);
          break;

        case Actions.JOIN:
          setUsers((users) => [...users, lastJsonMessage.data.user_id]);
          notifyUserJoined(
            lastJsonMessage.data.user_id +
              ' ' +
              translations('Classrooms.student-joined')
          );
          break;

        case Actions.LEAVE:
          setUsers((users) =>
            users.filter((user) => user !== lastJsonMessage.data.user_id)
          );
          notifyUserLeft(
            lastJsonMessage.data.user_id +
              ' ' +
              translations('Classrooms.student-left')
          );
          break;

        case Actions.CODE_CHANGE:
          if (lastJsonMessage.data.whiteboard.whiteboard_type === 'public') {
            myCodeRef.current = lastJsonMessage.data.code;
          } else if (
            lastJsonMessage.data.whiteboard.whiteboard_type === 'private' &&
            lastJsonMessage.data.user_id === selectedUser &&
            mode === ViewMode.ViewUserWhiteboard
          ) {
            codeRef.current = lastJsonMessage.data.code;
          } else if (
            lastJsonMessage.data.whiteboard.whiteboard_type === 'assignment' &&
            lastJsonMessage.data.user_id === selectedUser &&
            mode === ViewMode.Assignment &&
            lastJsonMessage.data.user_assignment.assignment.assignment_name ===
              selectedAssignment
          ) {
            codeRef.current = lastJsonMessage.data.code;
          }
          break;

        case Actions.GET_DATA:
          if (
            lastJsonMessage.data.whiteboard_type === 'public' &&
            mode === ViewMode.PersonalWhiteboard
          ) {
            myCodeRef.current = lastJsonMessage.data.code;
          } else if (
            lastJsonMessage.data.target_user === selectedUser &&
            lastJsonMessage.data.whiteboard_type === 'private' &&
            mode === ViewMode.ViewUserWhiteboard
          ) {
            codeRef.current = lastJsonMessage.data.code;
          } else if (
            lastJsonMessage.data.target_user === selectedUser &&
            lastJsonMessage.data.whiteboard_type === 'assignment' &&
            lastJsonMessage.data.user_assignment.assignment.assignment_name ===
              selectedAssignment &&
            mode === ViewMode.Assignment
          ) {
            codeRef.current =
              lastJsonMessage.data.user_assignment.whiteboard.code;
          }
          break;

        case Actions.ASSIGNMENT_CREATE:
          setAssignments((assignments) => [
            ...assignments,
            lastJsonMessage.data,
          ]);

          setIsAssignmentUsersDropdownOpen((isAssignmentUsersDropdownOpen) => [
            ...isAssignmentUsersDropdownOpen,
            {
              id: lastJsonMessage.data.assignment_id,
              isOpen: false,
            },
          ]);

          notifyAssignmentCreated(
            translations('Classrooms.assignment-created')
          );
          setTimeout(() => {
            toast.dismiss();
          }, 1000);
          closeCreateAssignmentDialog();
          break;
      }
      setLastAction(parseInt(lastJsonMessage.action));
      setMessageHandled(true);
    }
  }, [
    selectedUser,
    lastJsonMessage,
    translations,
    messageHandled,
    mode,
    selectedAssignment,
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
                  setMode(ViewMode.PersonalWhiteboard);
                }}
                disabled={mode === ViewMode.PersonalWhiteboard}
                variant={ButtonVariant.PRIMARY}>
                {translations('Classrooms.shared-whiteboard')}
              </Button>
              {users?.length > 0 &&
                users.map((u) => (
                  <Button
                    key={u}
                    onClick={() => {
                      setSelectedUser(u);
                      setMode(ViewMode.ViewUserWhiteboard);
                    }}
                    disabled={
                      u === selectedUser && mode === ViewMode.ViewUserWhiteboard
                    }
                    type="button"
                    variant={ButtonVariant.PRIMARY}>
                    {u}
                  </Button>
                ))}
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
                  <div className="flex flex-col" key={a.assignment_id}>
                    <Button
                      type="button"
                      onClick={handleAssignmentUsersDropdown(a.assignment_id)}
                      variant={ButtonVariant.PRIMARY}>
                      <div className="flex flex-row items-center justify-center gap-2">
                        {returnAssignmentUsersDropdownOpen(a.assignment_id) ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                        {a.assignment_name}
                      </div>
                    </Button>

                    {users?.length > 0 &&
                      returnAssignmentUsersDropdownOpen(a.assignment_id) &&
                      users.map((u) => (
                        <Button
                          key={u}
                          onClick={() => {
                            setSelectedAssignment(a.assignment_name);
                            setSelectedUser(u);
                            setMode(ViewMode.Assignment);
                          }}
                          disabled={
                            u === selectedUser &&
                            mode === ViewMode.Assignment &&
                            a.assignment_name === selectedAssignment
                          }
                          type="button"
                          variant={ButtonVariant.FLAT_SECONDARY}>
                          {u}
                        </Button>
                      ))}

                    {users?.length === 0 &&
                      returnAssignmentUsersDropdownOpen(a.assignment_id) &&
                      translations('Classrooms.no-users')}
                  </div>
                ))}

              {assignments?.length === 0 &&
                isAssignmentsMenuOpen &&
                translations('Classrooms.no-assignments-created')}
              {isAssignmentsMenuOpen && (
                <div className="flex flex-col items-center">
                  <Button
                    type="button"
                    variant={ButtonVariant.PRIMARY}
                    onClick={openCreateAssignmentDialog}
                    className="m-0 flex h-8 w-8 flex-col items-center justify-center p-0">
                    <PlusIcon className="h-6 w-6" />
                  </Button>
                  <StyledDialog
                    title={translations('Classrooms.assignment-popup-title')}
                    isOpen={isCreateAssignmentDialogOpen}
                    onClose={closeCreateAssignmentDialog}>
                    <div className="py-6">
                      <form
                        method="dialog"
                        onSubmit={handleSubmit(onCreateAssignmentSubmit)}>
                        <div className="flex flex-col gap-y-2">
                          <Input
                            label="assignment_name"
                            name="assignment_name"
                            type="text"
                            register={register}
                            required
                            maxLength={50}
                            placeholder={translations(
                              'Classrooms.assignment-name'
                            )}></Input>
                          <Input
                            label="assignment_description"
                            name="assignment_description"
                            type="text"
                            register={register}
                            required
                            maxLength={200}
                            placeholder={translations(
                              'Classrooms.assignment-description'
                            )}></Input>
                        </div>
                        <div className="mt-6 flex flex-row items-center justify-end">
                          <Button
                            onClick={closeCreateAssignmentDialog}
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
                </div>
              )}
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

              {mode === ViewMode.PersonalWhiteboard && (
                <div>
                  {!isEditable ? (
                    <Button
                      variant={ButtonVariant.FLAT_SECONDARY}
                      disabled={mode !== ViewMode.PersonalWhiteboard}
                      onClick={() => {
                        setIsEditable(true);
                        sendJsonMessage({
                          action: Actions.UNLOCK_CODE,
                          user_id: user.username,
                          data: null,
                        });
                      }}>
                      {translations('Classrooms.allow-editing')}
                    </Button>
                  ) : (
                    <Button
                      variant={ButtonVariant.FLAT_SECONDARY}
                      onClick={() => {
                        setIsEditable(false);
                        sendJsonMessage({
                          action: Actions.LOCK_CODE,
                          user_id: user.username,
                          data: null,
                        });
                      }}>
                      {translations('Classrooms.lock-editing')}
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div>
              {mode === ViewMode.PersonalWhiteboard ? (
                <ClassroomCodeEditor
                  connState={readyState}
                  sendMsg={sendJsonMessage}
                  roomId={classroomId}
                  onCodeChange={(code) => {
                    myCodeRef.current = code;
                  }}
                  lastAction={lastAction}
                  setLastAction={setLastAction}
                  codeRef={myCodeRef}
                  user={user}
                  isTeacher={true}
                  mode={mode}
                />
              ) : (
                <ClassroomCodeEditor
                  connState={readyState}
                  sendMsg={sendJsonMessage}
                  roomId={classroomId}
                  onCodeChange={(code) => {
                    codeRef.current = code;
                  }}
                  lastAction={lastAction}
                  setLastAction={setLastAction}
                  codeRef={codeRef}
                  user={user}
                  targetUser={selectedUser}
                  isTeacher={true}
                  assignmentName={selectedAssignment}
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
