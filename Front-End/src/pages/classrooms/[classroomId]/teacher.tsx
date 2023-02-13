import React, { useState, useEffect, useRef, useMemo } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import {
  Actions,
  WEBSITE_TITLE,
  ViewMode,
  WhiteboardType,
} from '@app/constants';
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
  notifyAssignmentCreated,
} from '@app/notifications';
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import Input from '@app/components/Input';
import type CodeChangeRes from '@app/models/classroom/JsonDataModels/response/CodeChange';
import type JoinTeacherRes from '@app/models/classroom/JsonDataModels/response/JoinTeacher';
import type AssignmentCreateReq from '@app/models/classroom/JsonDataModels/request/AssignmentCreate';
import type JsonRequest from '@app/models/classroom/JsonDataModels/request/JsonRequest';
import type GetDataRes from '@app/models/classroom/JsonDataModels/response/GetData';
import type GetDataReq from '@app/models/classroom/JsonDataModels/request/GetData';
import type ClassroomAssignment from '@app/models/classroom/ClassroomAssignment';
import type ClassroomUser from '@app/models/classroom/ClassroomUser';
import debounce from 'debounce';
import {
  selectPlaygroundData,
  selectPlaygroundError,
  sendCode,
} from '@app/features/playground/playgroundSlice';
import TextArea from '@app/components/TextArea';

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
      assignmentName: string;
      assignmentDescription: string;
      assignmentCode: string;
    }>();
  const [user, isLoggedIn] = useAuthRedirect();
  const translations = useTranslations();
  const dispatch = useDispatch();
  const classrooms = useAppSelector(selectClassroomsData);
  const classroomSessionsData = useAppSelector(selectClassroomSessionsData);
  const playgroundData = useAppSelector(selectPlaygroundData);
  const playgroundError = useAppSelector(selectPlaygroundError);
  const socketUrl = `${process.env.NEXT_PUBLIC_WS_BASE_URL}/${classroomId}`;
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
      (assignment: UserAssignment) => assignment.id === id
    );
    newAssignment.isOpen = !newAssignment.isOpen;

    setIsAssignmentUsersDropdownOpen(
      isAssignmentUsersDropdownOpen.map((assignment: UserAssignment) =>
        assignment.id === newAssignment.id ? newAssignment : assignment
      )
    );
  };

  const returnAssignmentUsersDropdownOpen = (id: string) => {
    const searchedAssignment = isAssignmentUsersDropdownOpen.filter(
      (assignment: UserAssignment) => assignment.id === id
    );
    return searchedAssignment.length > 0 ? searchedAssignment[0].isOpen : false;
  };

  useEffect(() => {
    const joinRequestMsg: JsonRequest<null> = {
      action: Actions.TEACHER_JOIN,
      user_id: user.username,
      data: null,
    };

    switch (readyState) {
      case ReadyState.OPEN:
        sendJsonMessage(joinRequestMsg);
        toast.success(translations('Classrooms.connected'), {
          id: connectNotification.current,
        });
        setTimeout(() => {
          toast.dismiss();
        }, 1000);
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
    const getUserCode = async (
      student: string,
      whiteboardType: WhiteboardType.PRIVATE | WhiteboardType.ASSIGNMENT,
      assignmentName: string | null
    ) => {
      const requestMsg: JsonRequest<GetDataReq> = {
        action: Actions.GET_DATA,
        user_id: user.username,
        data: {
          whiteboard_type: whiteboardType,
          target_user: student,
          assignment_name: assignmentName,
        },
      };
      sendJsonMessage(requestMsg);
    };

    switch (mode) {
      case ViewMode.PersonalWhiteboard:
        setSelectedAssignment('');
        setSelectedUser('');
        break;
      case ViewMode.ViewUserWhiteboard:
        if (selectedUser !== '')
          getUserCode(selectedUser, WhiteboardType.PRIVATE, null);
        break;
      case ViewMode.Assignment:
        if (selectedUser !== '' && selectedAssignment !== '') {
          getUserCode(
            selectedUser,
            WhiteboardType.ASSIGNMENT,
            selectedAssignment
          );
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
            const requestMsg: JsonRequest<null> = {
              action: Actions.CLASSROOM_DELETED,
              user_id: user.username,
              data: null,
            };
            sendJsonMessage(requestMsg);
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
    assignmentName: string;
    assignmentDescription: string;
    assignmentCode: string;
  }) => {
    const { assignmentName, assignmentDescription, assignmentCode } = data;
    setValue('assignmentName', '');
    setValue('assignmentDescription', '');
    setValue('assignmentCode', '');
    const requestMsg: JsonRequest<AssignmentCreateReq> = {
      action: Actions.ASSIGNMENT_CREATE,
      user_id: user.username,
      data: {
        assignment_name: assignmentName,
        assignment_description: assignmentDescription,
        assignment_code: assignmentCode,
      },
    };

    sendJsonMessage(requestMsg);
  };

  useEffect(() => {
    if (lastJsonMessage != null) {
      setMessageHandled(false);
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    const responseMsg = lastJsonMessage as JsonRequest<unknown>;
    const usersDropdown = [];

    if (!messageHandled && responseMsg != null) {
      if (responseMsg.action === Actions.SYNC_DATA) {
        const data = responseMsg.data as JoinTeacherRes;
        const students = data.classroomData.users.filter(
          (student: ClassroomUser) => student.userId !== user.username
        ) as ClassroomUser[];
        setUsers(students);
        setIsEditable(data.classroomData.editable);
        myCodeRef.current = data.classroomData.sharedWhiteboard.code;
        setAssignments(data.classroomData.assignments);
        data.classroomData.assignments.forEach((assignment) => {
          usersDropdown.push({
            id: assignment.id,
            isOpen: false,
          });
        });
        setIsAssignmentUsersDropdownOpen(usersDropdown);
      } else if (responseMsg.action === Actions.JOIN) {
        const newUser = responseMsg.data as ClassroomUser;
        if (!users.find((user) => user.userId === newUser.userId)) {
          setUsers((students) => [...students, newUser]);
          notifyUserJoined(
            newUser.userId + ' ' + translations('Classrooms.student-joined')
          );
        }
      } else if (responseMsg.action === Actions.LEAVE) {
        const removedUser = responseMsg.data as ClassroomUser;
        setUsers((students) =>
          students.filter((user) => user !== removedUser.userId)
        );
        notifyUserLeft(
          removedUser.userId + ' ' + translations('Classrooms.student-left')
        );
      } else if (responseMsg.action === Actions.CODE_CHANGE) {
        const data = responseMsg.data as CodeChangeRes;

        if (data.whiteboard.whiteboardType === WhiteboardType.PUBLIC) {
          myCodeRef.current = data.whiteboard.code;
        } else if (
          data.whiteboard.whiteboardType === WhiteboardType.PRIVATE &&
          data.source.userId === selectedUser &&
          mode === ViewMode.ViewUserWhiteboard
        ) {
          codeRef.current = data.whiteboard.code;
        } else if (
          data.whiteboard.whiteboardType === WhiteboardType.ASSIGNMENT &&
          data.source.userId === selectedUser &&
          mode === ViewMode.Assignment &&
          data.userAssignment.assignment.title === selectedAssignment
        ) {
          codeRef.current = data.whiteboard.code;
        }
      } else if (responseMsg.action === Actions.GET_DATA) {
        const data = responseMsg.data as GetDataRes;

        if (
          data.whiteboard?.whiteboardType === WhiteboardType.PUBLIC &&
          mode === ViewMode.PersonalWhiteboard
        ) {
          myCodeRef.current = data.whiteboard.code;
        } else if (
          data.targetUser?.userId === selectedUser &&
          mode === ViewMode.ViewUserWhiteboard
        ) {
          codeRef.current = data.targetUser.whiteboard.code;
        } else if (
          data.targetUser?.userId === selectedUser &&
          data.userAssignment?.assignment.title === selectedAssignment &&
          mode === ViewMode.Assignment
        ) {
          codeRef.current = data.userAssignment.whiteboard.code;
        }
      } else if (responseMsg.action === Actions.ASSIGNMENT_CREATE) {
        const newAssignment = responseMsg.data as ClassroomAssignment;
        setAssignments((assignments) => [...assignments, newAssignment]);

        setIsAssignmentUsersDropdownOpen((isAssignmentUsersDropdownOpen) => [
          ...isAssignmentUsersDropdownOpen,
          {
            id: newAssignment.id,
            isOpen: false,
          },
        ]);

        notifyAssignmentCreated(translations('Classrooms.assignment-created'));
        setTimeout(() => {
          toast.dismiss();
        }, 1000);
        closeCreateAssignmentDialog();
      }

      setLastAction(responseMsg.action);
      setMessageHandled(true);
    }
  }, [
    lastJsonMessage,
    messageHandled,
    mode,
    selectedAssignment,
    selectedUser,
    translations,
    user.username,
    users,
  ]);

  const runCode = useMemo(
    () =>
      debounce(() => {
        let code: string = null;

        if (mode === ViewMode.PersonalWhiteboard) {
          code = myCodeRef.current;
        } else {
          code = codeRef.current;
        }

        try {
          dispatch(sendCode({ content: code }));
        } catch (error) {
          console.error(error);
        }
      }, 1000),
    [dispatch, mode]
  );

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
                users.map((user: ClassroomUser) => (
                  <Button
                    key={user.userId}
                    onClick={() => {
                      setSelectedUser(user.userId);
                      setMode(ViewMode.ViewUserWhiteboard);
                    }}
                    disabled={
                      user.userId === selectedUser &&
                      mode === ViewMode.ViewUserWhiteboard
                    }
                    type="button"
                    variant={ButtonVariant.PRIMARY}>
                    {user.userId}
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
                assignments.map((assignment: ClassroomAssignment) => (
                  <div className="flex flex-col" key={assignment.id}>
                    <Button
                      type="button"
                      onClick={handleAssignmentUsersDropdown(assignment.id)}
                      variant={ButtonVariant.PRIMARY}>
                      <div className="flex flex-row items-center justify-center gap-2">
                        {returnAssignmentUsersDropdownOpen(assignment.id) ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                        {assignment.title}
                      </div>
                    </Button>

                    {users?.length > 0 &&
                      returnAssignmentUsersDropdownOpen(assignment.id) &&
                      users.map((user: ClassroomUser) => (
                        <Button
                          key={user.userId}
                          onClick={() => {
                            setSelectedAssignment(assignment.title);
                            setSelectedUser(user.userId);
                            setMode(ViewMode.Assignment);
                          }}
                          disabled={
                            user.userId === selectedUser &&
                            mode === ViewMode.Assignment &&
                            assignment.title === selectedAssignment
                          }
                          type="button"
                          variant={ButtonVariant.FLAT_SECONDARY}>
                          {user.userId}
                        </Button>
                      ))}

                    {users?.length === 0 &&
                      returnAssignmentUsersDropdownOpen(assignment.id) &&
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
                            label="assignmentName"
                            name="assignmentName"
                            type="text"
                            register={register}
                            required
                            maxLength={20}
                            placeholder={translations(
                              'Classrooms.assignment-name'
                            )}></Input>
                          <Input
                            label="assignmentDescription"
                            name="assignmentDescription"
                            type="text"
                            register={register}
                            required
                            maxLength={200}
                            placeholder={translations(
                              'Classrooms.assignment-description'
                            )}></Input>
                          <TextArea
                            label="assignmentCode"
                            name="assignmentCode"
                            type="text"
                            register={register}
                            required
                            className="resize-none"
                            rows={4}
                            placeholder={translations(
                              'Classrooms.assignment-code'
                            )}
                          />
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
              <Button variant={ButtonVariant.FLAT_SECONDARY} onClick={runCode}>
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
            <div className="flex h-full flex-col justify-between overflow-hidden">
              <div className="h-auto max-h-96 overflow-scroll">
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
              <div
                className="min-h-60 h-auto max-h-60 border-t-2 border-neutral-50 pt-1 pl-1 font-mono text-xs dark:border-neutral-900"
                id="console">
                <p>{'Console >'}</p>
                <pre className="pb-1">
                  {playgroundData?.content || playgroundError}
                </pre>
              </div>
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
