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
  AssignmentStatus,
  connectionStatus,
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
  notifyClassroomDeleted,
  notifyUserJoined,
  notifyAssignmentCreated,
  notifyAssignmentGraded,
  notifyAccessCodeCopied,
} from '@app/notifications';
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardIcon,
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
import type AssignmentSendReviewRes from '@app/models/classroom/JsonDataModels/response/AssignmentSendReview';
import type ClassroomUserAssignment from '@app/models/classroom/ClassroomUserAssignment';
import type AssignmentCreateRes from '@app/models/classroom/JsonDataModels/response/AssignmentCreate';
import debounce from 'debounce';
import {
  selectPlaygroundData,
  selectPlaygroundError,
  sendCode,
} from '@app/features/playground/playgroundSlice';
import TextArea from '@app/components/TextArea';
import UserAssignmentButton from '@app/components/UserAssignmentButton';
import UserStatus from '@app/components/UserStatus';
import Checkbox from '@app/components/Checkbox';
import IconButton from '@app/components/IconButton';

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
  const {
    register: registerAssignment,
    handleSubmit: handleAssignmentSubmit,
    setValue: setAssignmentValue,
  } = useForm<{
    assignmentName: string;
    assignmentDescription: string;
    assignmentCode: string;
  }>();
  const {
    register: registerGrade,
    handleSubmit: handleGradeSubmit,
    setValue: setGradeValue,
  } = useForm<{
    grade: number;
    correctable: boolean;
    feedback: string;
  }>();
  const [user, isLoggedIn] = useAuthRedirect();
  const translations = useTranslations();
  const pageTitle = `${translations(
    'Meta.title-classrooms'
  )} - ${WEBSITE_TITLE}`;
  const dispatch = useDispatch();
  const classrooms = useAppSelector(selectClassroomsData);
  const classroomSessionsData = useAppSelector(selectClassroomSessionsData);
  const playgroundData = useAppSelector(selectPlaygroundData);
  const playgroundError = useAppSelector(selectPlaygroundError);
  const socketUrl = `${process.env.NEXT_PUBLIC_WS_BASE_URL}/${classroomId}`;
  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebSocket(socketUrl);
  const accessCode = useMemo(() => {
    const classroom = classrooms?.find((c) => c.id.toString() === classroomId);
    return classroom?.access_code;
  }, [classrooms, classroomId]);

  const codeRef = useRef('print("Hello World")\n\n\n\n\n\n\n\n\n\n');
  const myCodeRef = useRef('print("Hello World")\n\n\n\n\n\n\n\n\n\n');
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
  const [isGradeAssignmentDialogOpen, setIsGradeAssignmentDialogOpen] =
    useState(false);
  const [isGradeHistoryDialogOpen, setIsGradeHistoryDialogOpen] =
    useState(false);

  const closeGradeAssignmentDialog = () => {
    setIsGradeAssignmentDialogOpen(false);
  };

  const openGradeAssignmentDialog = () => {
    setIsGradeAssignmentDialogOpen(true);
  };

  const closeGradeHistoryDialog = () => {
    setIsGradeHistoryDialogOpen(false);
  };

  const openGradeHistoryDialog = () => {
    setIsGradeHistoryDialogOpen(true);
  };

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
        setTimeout(() => {
          toast.dismiss();
          router.replace('/');
        }, 1000);
      }
      if (classroomSessionsData?.length > 0) {
        if (classroomSessionsData[0].is_teacher === false) {
          setTimeout(() => {
            toast.dismiss();
            router.replace(
              `/classrooms/${classroomSessionsData[0].classroom_id}/student`
            );
          }, 1000);
        }
      } else {
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
    setAssignmentValue('assignmentName', '');
    setAssignmentValue('assignmentDescription', '');
    setAssignmentValue('assignmentCode', '');
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
    closeCreateAssignmentDialog();
  };

  const onGradeAssignmentSubmit = (data: {
    grade: number;
    correctable: boolean;
    feedback: string;
  }) => {
    const { grade, correctable, feedback } = data;
    setGradeValue('grade', null);
    setGradeValue('correctable', false);
    setGradeValue('feedback', '');

    const d = new Date();
    const date =
      [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('/') +
      ' ' +
      [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');

    // Update userAssignment from the selected user in users
    const updatedUsers: ClassroomUser[] = users;
    const selectedUserIndex = updatedUsers.findIndex(
      (user: ClassroomUser) => user.userId === selectedUser
    );
    const selectedUserAssignmentIndex = updatedUsers[
      selectedUserIndex
    ].userAssignments.findIndex(
      (userAssignment: ClassroomUserAssignment) =>
        userAssignment.assignment.title === selectedAssignment
    );
    updatedUsers[selectedUserIndex].userAssignments[
      selectedUserAssignmentIndex
    ].grade = grade;
    updatedUsers[selectedUserIndex].userAssignments[
      selectedUserAssignmentIndex
    ].feedback = feedback;
    updatedUsers[selectedUserIndex].userAssignments[
      selectedUserAssignmentIndex
    ].status = correctable
      ? AssignmentStatus.CORRECTABLE
      : AssignmentStatus.COMPLETED;
    updatedUsers[selectedUserIndex].userAssignments[
      selectedUserAssignmentIndex
    ].gradeHistory.push({
      grade,
      feedback,
      timestamp: date,
    });
    setUsers(updatedUsers);
    //

    // get userAssignment from the selected user in users
    const selectedUserAssignment: ClassroomUserAssignment = updatedUsers[
      selectedUserIndex
    ].userAssignments.find(
      (userAssignment: ClassroomUserAssignment) =>
        userAssignment.assignment.title === selectedAssignment
    );
    //

    const requestMsg: JsonRequest<ClassroomUserAssignment> = {
      action: Actions.GRADE_ASSIGNMENT,
      user_id: user.username,
      data: selectedUserAssignment,
    };

    sendJsonMessage(requestMsg);
    closeGradeAssignmentDialog();

    notifyAssignmentGraded(translations('Classrooms.assignment-graded'));
    setTimeout(() => {
      toast.dismiss();
    }, 1000);
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
      console.log('responseMsg:', responseMsg);
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
          setTimeout(() => {
            toast.dismiss();
          }, 1000);
        } else {
          const updatedUsers: ClassroomUser[] = users;
          const existingUserIndex = updatedUsers.findIndex(
            (user: ClassroomUser) => user.userId === newUser.userId
          );
          updatedUsers[existingUserIndex].online = true;
          setUsers(updatedUsers);
        }
      } else if (responseMsg.action === Actions.LEAVE) {
        const removedUser = responseMsg.data as ClassroomUser;
        const updatedUsers: ClassroomUser[] = users;
        const removedUserIndex = updatedUsers.findIndex(
          (user: ClassroomUser) => user.userId === removedUser.userId
        );
        updatedUsers[removedUserIndex].online = false;
        setUsers(updatedUsers);
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
        const data = responseMsg.data as AssignmentCreateRes;
        setAssignments((assignments) => [...assignments, data.assignment]);

        setIsAssignmentUsersDropdownOpen((isAssignmentUsersDropdownOpen) => [
          ...isAssignmentUsersDropdownOpen,
          {
            id: data.assignment.id,
            isOpen: false,
          },
        ]);

        setUsers(data.students);

        notifyAssignmentCreated(translations('Classrooms.assignment-created'));
        setTimeout(() => {
          toast.dismiss();
        }, 1000);
      } else if (responseMsg.action === Actions.SUBMIT_ASSIGNMENT) {
        const data = responseMsg.data as AssignmentSendReviewRes;
        // Access users userAssignment array and update the assignment with new status
        const updatedUsers = users.map((user) => {
          if (user.userId === data.source.userId) {
            const updatedUserAssignments = user.userAssignments.map(
              (userAssignment: ClassroomUserAssignment) => {
                if (
                  userAssignment.assignment.id ===
                  data.userAssignment.assignment.id
                ) {
                  return {
                    ...userAssignment,
                    status: data.userAssignment.status,
                  };
                }
                return userAssignment;
              }
            );
            return {
              ...user,
              userAssignments: updatedUserAssignments,
            };
          }
          return user;
        });
        setUsers(updatedUsers);
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

  const returnUserAssignment = (
    user: ClassroomUser,
    assignment: ClassroomAssignment
  ) => {
    return user.userAssignments.find(
      (userAssignment) => userAssignment.assignment.id === assignment.id
    );
  };

  const returnUserAssignmentByName = (
    user: string,
    assignment: string
  ): ClassroomUserAssignment => {
    const userObj = users.find(
      (userObj: ClassroomUser) => userObj.userId === user
    );
    const userAssignmentObj = userObj.userAssignments.find(
      (userAssignmentObj: ClassroomUserAssignment) =>
        userAssignmentObj.assignment.title === assignment
    );
    return userAssignmentObj;
  };

  const copyAccessCode = () => {
    navigator.clipboard.writeText(accessCode);
    notifyAccessCodeCopied(
      translations('Classrooms.access-code-copied-notification')
    );
    setTimeout(() => {
      toast.dismiss();
    }, 1000);
  };

  return (
    <>
      <div>
        <Toaster position="top-center" reverseOrder={false} />
      </div>
      <Head>
        <title>{pageTitle}</title>
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
        <div className="flex h-full flex-1 flex-row overflow-hidden">
          <div className="flex h-full w-1/6 flex-1 flex-col justify-between border-r-2 border-neutral-50 bg-white p-6 dark:border-neutral-900 dark:bg-neutral-800">
            <div className="mb-8 flex h-full flex-col justify-start space-y-2 overflow-hidden align-middle">
              <h5>Connection status: {connectionStatus[readyState]}</h5>
              <IconButton
                type="button"
                icon={<ClipboardIcon className="h-5 w-5 p-0" />}
                className="place-content-center p-0.5"
                onClick={() => {
                  copyAccessCode();
                }}
                variant={ButtonVariant.SUCCESS}>
                {translations('Classrooms.access-code-copy-btn')}
              </IconButton>
              <h2 className="mb-4 text-center text-2xl font-bold">
                {translations('Classrooms.whiteboards')}
              </h2>
              <div className="flex max-h-full flex-col justify-start space-y-2 overflow-auto align-middle">
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
                    <UserStatus
                      translations={translations}
                      key={user.userId}
                      user={user}
                      onClick={() => {
                        setSelectedUser(user.userId);
                        setMode(ViewMode.ViewUserWhiteboard);
                      }}
                      disabled={
                        user.userId === selectedUser &&
                        mode === ViewMode.ViewUserWhiteboard
                      }
                    />
                  ))}
              </div>
              <h2 className="mb-4 text-center text-2xl font-bold">
                {translations('Classrooms.assignments')}
              </h2>
              <div className="flex h-auto flex-col space-y-2 overflow-auto rounded-lg border-2 border-neutral-200 p-2 dark:border-neutral-600">
                <Button
                  type="button"
                  variant={ButtonVariant.FLAT_SECONDARY}
                  onClick={handleAssignmentsMenu}>
                  <div className="flex flex-row items-center justify-center ">
                    {isAssignmentsMenuOpen ? (
                      <ChevronDownIcon className="mr-2 h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="mr-2 h-4 w-4" />
                    )}
                    {translations('Classrooms.assignments')}
                  </div>
                </Button>
                {assignments?.length > 0 &&
                  isAssignmentsMenuOpen &&
                  assignments.map((assignment: ClassroomAssignment) => (
                    <div
                      className="flex flex-col space-y-2 rounded-lg border-2 border-neutral-200 p-1 dark:border-neutral-600"
                      key={assignment.id}>
                      <Button
                        type="button"
                        onClick={handleAssignmentUsersDropdown(assignment.id)}
                        variant={ButtonVariant.FLAT_SECONDARY}>
                        <div className="flex flex-row items-center justify-center space-y-2">
                          {returnAssignmentUsersDropdownOpen(assignment.id) ? (
                            <ChevronDownIcon className="mr-2 h-4 w-4" />
                          ) : (
                            <ChevronRightIcon className="mr-2 h-4 w-4" />
                          )}
                          {assignment.title}
                        </div>
                      </Button>

                      {users?.length > 0 &&
                        returnAssignmentUsersDropdownOpen(assignment.id) &&
                        users.map((user: ClassroomUser) => (
                          <UserAssignmentButton
                            key={user.userId}
                            translations={translations}
                            disabled={
                              user.userId === selectedUser &&
                              mode === ViewMode.Assignment &&
                              assignment.title === selectedAssignment
                            }
                            userAssignment={returnUserAssignment(
                              user,
                              assignment
                            )}
                            switchToAssignmentView={() => {
                              setSelectedAssignment(assignment.title);
                              setSelectedUser(user.userId);
                              setMode(ViewMode.Assignment);
                            }}></UserAssignmentButton>
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
                  <div className="flex flex-row items-center justify-center">
                    <Button
                      type="button"
                      variant={ButtonVariant.OUTLINE}
                      onClick={openCreateAssignmentDialog}
                      className="m-0 ml-2 flex h-6 w-6 flex-col items-center justify-center p-0">
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                    <StyledDialog
                      title={translations('Classrooms.assignment-popup-title')}
                      isOpen={isCreateAssignmentDialogOpen}
                      onClose={closeCreateAssignmentDialog}>
                      <div className="py-6">
                        <form
                          method="dialog"
                          onSubmit={handleAssignmentSubmit(
                            onCreateAssignmentSubmit
                          )}>
                          <div className="flex flex-col gap-y-2">
                            <Input
                              label="assignmentName"
                              name="assignmentName"
                              type="text"
                              register={registerAssignment}
                              required
                              maxLength={20}
                              minLength={3}
                              placeholder={translations(
                                'Classrooms.assignment-name'
                              )}></Input>
                            <TextArea
                              label="assignmentDescription"
                              name="assignmentDescription"
                              type="text"
                              register={registerAssignment}
                              required
                              minLength={3}
                              rows={8}
                              placeholder={translations(
                                'Classrooms.assignment-description'
                              )}></TextArea>
                            <TextArea
                              label="assignmentCode"
                              name="assignmentCode"
                              type="text"
                              register={registerAssignment}
                              className="resize-none"
                              cols={80}
                              rows={15}
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
                            <Button
                              type="submit"
                              variant={ButtonVariant.PRIMARY}>
                              {translations('Classrooms.submit')}
                            </Button>
                          </div>
                        </form>
                      </div>
                    </StyledDialog>
                  </div>
                )}
              </div>
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

          <div className="flex h-full w-5/6 flex-col bg-white dark:bg-neutral-800">
            <div className="flex h-16 flex-row items-center justify-between border-b-2 border-neutral-50 p-4 dark:border-neutral-900">
              <Button variant={ButtonVariant.PRIMARY} onClick={runCode}>
                {translations('Classrooms.run')}
              </Button>

              {mode === ViewMode.PersonalWhiteboard && (
                <div>
                  {!isEditable ? (
                    <Button
                      variant={ButtonVariant.PRIMARY}
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
                      variant={ButtonVariant.PRIMARY}
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
              {mode === ViewMode.Assignment && (
                <>
                  <h4>{selectedAssignment}</h4>
                  {returnUserAssignmentByName(selectedUser, selectedAssignment)
                    .status === AssignmentStatus.SUBMITTED ? (
                    <div className="flex flex-row space-x-2">
                      <Button
                        variant={ButtonVariant.PRIMARY}
                        onClick={openGradeAssignmentDialog}>
                        {translations('Classrooms.grade')}
                      </Button>
                      <StyledDialog
                        title={translations(
                          'Classrooms.grade-assignment-form-title'
                        )}
                        isOpen={isGradeAssignmentDialogOpen}
                        onClose={closeGradeAssignmentDialog}>
                        <div className="py-6">
                          <form
                            method="dialog"
                            onSubmit={handleGradeSubmit(
                              onGradeAssignmentSubmit
                            )}>
                            <div className="flex flex-col gap-y-2">
                              <Input
                                label="grade"
                                name="grade"
                                type="number"
                                min={2}
                                max={5}
                                step={0.5}
                                register={registerGrade}
                                required
                                placeholder={translations(
                                  'Classrooms.assignment-grade-label'
                                )}></Input>
                              <div className="flex items-center">
                                <Checkbox
                                  id="correctable"
                                  label="correctable"
                                  name="correctable"
                                  register={registerGrade}></Checkbox>
                                <label htmlFor="correctable" className="ml-2">
                                  {translations(
                                    'Classrooms.work-correctable-label'
                                  )}
                                </label>
                              </div>
                              <TextArea
                                label="feedback"
                                name="feedback"
                                type="text"
                                register={registerGrade}
                                className="resize-none"
                                rows={8}
                                cols={60}
                                placeholder={translations(
                                  'Classrooms.assignment-feedback-label'
                                )}
                              />
                            </div>
                            <div className="mt-6 flex flex-row items-center justify-end">
                              <Button
                                onClick={closeGradeAssignmentDialog}
                                className="mr-2"
                                variant={ButtonVariant.DANGER}>
                                {translations('Classrooms.cancel')}
                              </Button>
                              <Button
                                type="submit"
                                variant={ButtonVariant.PRIMARY}>
                                {translations('Classrooms.submit')}
                              </Button>
                            </div>
                          </form>
                        </div>
                      </StyledDialog>
                      <Button
                        variant={ButtonVariant.PRIMARY}
                        onClick={openGradeHistoryDialog}>
                        {translations('Classrooms.grade-history-btn')}
                      </Button>
                      <StyledDialog
                        title={translations('Classrooms.grade-history-title')}
                        isOpen={isGradeHistoryDialogOpen}
                        onClose={closeGradeHistoryDialog}>
                        <div className=" w-64  py-6">
                          <div className="flex max-h-96 flex-col gap-y-2 overflow-auto">
                            {returnUserAssignmentByName(
                              selectedUser,
                              selectedAssignment
                            ).gradeHistory.map((grade, index) => {
                              return (
                                <div
                                  key={index}
                                  className="flex flex-row items-center justify-between">
                                  <div className="my-4 flex flex-col gap-y-2">
                                    <span>
                                      {translations(
                                        'Classrooms.assignment-grade-label'
                                      )}
                                      : {grade.grade}
                                    </span>
                                    <span>
                                      {translations(
                                        'Classrooms.assignment-feedback-label'
                                      )}
                                      : {grade.feedback}
                                    </span>
                                    <span>
                                      {translations(
                                        'Classrooms.assignment-date-label'
                                      )}
                                      : {grade.timestamp}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-6 flex flex-row items-center justify-end">
                            <Button
                              onClick={closeGradeHistoryDialog}
                              className="mr-2"
                              variant={ButtonVariant.DANGER}>
                              {translations('Classrooms.close-dialog')}
                            </Button>
                          </div>
                        </div>
                      </StyledDialog>
                    </div>
                  ) : (
                    <div className="flex flex-row space-x-2">
                      <Button variant={ButtonVariant.PRIMARY} disabled>
                        {translations('Classrooms.grade')}
                      </Button>
                      <Button
                        variant={ButtonVariant.PRIMARY}
                        onClick={openGradeHistoryDialog}>
                        {translations('Classrooms.grade-history-btn')}
                      </Button>
                      <StyledDialog
                        title={translations('Classrooms.grade-history-title')}
                        isOpen={isGradeHistoryDialogOpen}
                        onClose={closeGradeHistoryDialog}>
                        <div className=" w-64  py-6">
                          <div className="flex max-h-96 flex-col gap-y-2 overflow-auto">
                            {returnUserAssignmentByName(
                              selectedUser,
                              selectedAssignment
                            ).gradeHistory.map((grade, index) => {
                              return (
                                <div
                                  key={index}
                                  className="flex flex-row items-center justify-between">
                                  <div className="my-4 flex flex-col gap-y-2">
                                    <span>
                                      {translations(
                                        'Classrooms.assignment-grade-label'
                                      )}
                                      : {grade.grade}
                                    </span>
                                    <span>
                                      {translations(
                                        'Classrooms.assignment-feedback-label'
                                      )}
                                      : {grade.feedback}
                                    </span>
                                    <span>
                                      {translations(
                                        'Classrooms.assignment-date-label'
                                      )}
                                      : {grade.timestamp}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-6 flex flex-row items-center justify-end">
                            <Button
                              onClick={closeGradeHistoryDialog}
                              className="mr-2"
                              variant={ButtonVariant.DANGER}>
                              {translations('Classrooms.close-dialog')}
                            </Button>
                          </div>
                        </div>
                      </StyledDialog>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex h-full flex-col">
              <div className="h-full overflow-y-scroll">
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
                className="h-2/6 overflow-y-scroll border-t-2 border-neutral-50 pt-1 pl-1 font-mono text-xs dark:border-neutral-900"
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
