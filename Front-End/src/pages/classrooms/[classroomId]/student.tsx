import React, { useState, useEffect, useRef, useMemo } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import toast from 'react-hot-toast';
import Head from 'next/head';
import debounce from 'debounce';
import { useTranslations } from 'next-intl';
import router from 'next/router';
import dynamic from 'next/dynamic';

import { useDispatch } from 'react-redux';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import {
  Actions,
  AssignmentStatus,
  ViewMode,
  WEBSITE_TITLE,
  WhiteboardType,
} from '@app/constants';
import { wrapper } from '@app/store';
import NavBar from '@app/components/NavBar';
import ClassroomCodeEditor from '@app/features/classroomCodeEditor/ClassroomCodeEditor';
import Button, { ButtonVariant } from '@app/components/Button';
import {
  fetchClassrooms,
  selectClassroomsData,
} from '@app/features/classrooms/classroomsSlice';
import {
  deleteClassroomSession,
  fetchClassroomSessions,
  selectClassroomSessionsData,
} from '@app/features/classrooms/sessions/classroomSessionsSlice';
import StyledDialog from '@app/components/StyledDialog';
import {
  notifyUnauthorized,
  notifyClassroomLeave,
  notifyUserLeft,
  notifyClassroomDeleted,
} from '@app/notifications';
import {
  selectPlaygroundData,
  selectPlaygroundError,
  sendCode,
} from '@app/features/playground/playgroundSlice';

import type JoinUserRes from '@app/models/classroom/JsonDataModels/response/JoinUser';
import type CodeChangeRes from '@app/models/classroom/JsonDataModels/response/CodeChange';
import type ClassroomUser from '@app/models/classroom/ClassroomUser';
import type GetDataRes from '@app/models/classroom/JsonDataModels/response/GetData';
import type ClassroomAssignment from '@app/models/classroom/ClassroomAssignment';
import type JsonRequest from '@app/models/classroom/JsonDataModels/request/JsonRequest';
import type ClassroomUserAssignment from '@app/models/classroom/ClassroomUserAssignment';
import type GetDataReq from '@app/models/classroom/JsonDataModels/request/GetData';
import ConfettiExplosion from 'react-confetti-explosion';

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
  const pageTitle = `${translations(
    'Meta.title-classrooms'
  )} - ${WEBSITE_TITLE}`;
  const dispatch = useDispatch();
  const playgroundData = useAppSelector(selectPlaygroundData);
  const playgroundError = useAppSelector(selectPlaygroundError);
  const classrooms = useAppSelector(selectClassroomsData);
  const classroomSessionsData = useAppSelector(selectClassroomSessionsData);
  const { classroomId } = props;
  const socketUrl = `${process.env.NEXT_PUBLIC_WS_BASE_URL}/${classroomId}`;
  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebSocket(socketUrl);

  const codeRef = useRef(null);
  const myCodeRef = useRef('print("Hello World")\n\n\n\n\n\n\n\n\n\n');
  const connectNotification = useRef(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  const closeLeaveClassroomDialog = () => {
    setIsLeaveClassroomDialogOpen(false);
  };
  const openLeaveClassroomDialog = () => {
    setIsLeaveClassroomDialogOpen(true);
  };
  const closeFeedbackDialog = () => {
    setIsFeedbackDialogOpen(false);
  };
  const openFeedbackDialog = () => {
    setIsFeedbackDialogOpen(true);
  };
  const handleAssignmentsMenu = () => {
    setIsAssignmentsMenuOpen(!isAssignmentsMenuOpen);
  };

  useEffect(() => {
    const validate = () => {
      if (!classrooms?.find((c) => c.id.toString() === classroomId)) {
        notifyUnauthorized(translations('Classrooms.unauthorized'));
        setTimeout(() => {
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
            const leaveMsg: JsonRequest<null> = {
              action: Actions.LEAVE,
              user_id: user.username,
              data: null,
            };
            sendJsonMessage(leaveMsg);
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
    const joinRequestMsg: JsonRequest<null> = {
      action: Actions.JOIN,
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
    const getDataRequest = async (
      whiteboardType:
        | WhiteboardType.PRIVATE
        | WhiteboardType.ASSIGNMENT
        | WhiteboardType.PUBLIC,
      assignmentName: string | null
    ) => {
      const requestMsg: JsonRequest<GetDataReq> = {
        action: Actions.GET_DATA,
        user_id: user.username,
        data: {
          whiteboard_type: whiteboardType,
          target_user: user.username,
          assignment_name: assignmentName,
        },
      };
      sendJsonMessage(requestMsg);
    };

    if (mode !== null) {
      switch (mode) {
        case ViewMode.SharedWhiteboard:
          if (selectedAssignment !== '') {
            setSelectedAssignment('');
          } else {
            getDataRequest(WhiteboardType.PUBLIC, null);
          }
          break;
        case ViewMode.PersonalWhiteboard:
          if (selectedAssignment !== '') {
            setSelectedAssignment('');
          } else {
            getDataRequest(WhiteboardType.PRIVATE, null);
          }
          break;
        case ViewMode.Assignment:
          if (selectedAssignment !== '') {
            getDataRequest(WhiteboardType.ASSIGNMENT, selectedAssignment);
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
    const responseMsg = lastJsonMessage as JsonRequest<unknown>;
    if (!messageHandled && lastJsonMessage != null) {
      if (responseMsg.action === Actions.SYNC_DATA) {
        const data = responseMsg.data as JoinUserRes;
        setUsers(data.users);
        setTeacher(data.teacher);
        setIsEditable(data.classroomData.editable);
        myCodeRef.current = data.personalData.whiteboard.code;
        codeRef.current = data.classroomData.sharedWhiteboard.code;
        setAssignments(data.personalData.userAssignments);
      } else if (responseMsg.action === Actions.JOIN) {
        const newUser = responseMsg.data as ClassroomUser;

        setUsers((users) => [...users, newUser]);
      } else if (responseMsg.action === Actions.LEAVE) {
        const removedUser = responseMsg.data as ClassroomUser;

        if (removedUser.userId !== teacher) {
          setUsers((students) =>
            students.filter((user) => user !== removedUser.userId)
          );

          notifyUserLeft(
            removedUser.userId + ' ' + translations('Classrooms.student-left')
          );
        }
      } else if (responseMsg.action === Actions.CODE_CHANGE) {
        const data = responseMsg.data as CodeChangeRes;

        if (data.whiteboard.whiteboardType === WhiteboardType.PUBLIC) {
          codeRef.current = data.whiteboard.code;
        } else if (
          data.whiteboard.whiteboardType === WhiteboardType.PRIVATE &&
          data.source.userId === teacher.userId &&
          mode === ViewMode.PersonalWhiteboard
        ) {
          myCodeRef.current = data.whiteboard.code;
        } else if (
          data.whiteboard.whiteboardType === WhiteboardType.ASSIGNMENT &&
          selectedAssignment === data.userAssignment?.assignment.title &&
          mode === ViewMode.Assignment
        ) {
          myCodeRef.current = data.whiteboard.code;
        }
      } else if (responseMsg.action === Actions.GET_DATA) {
        const data = responseMsg.data as GetDataRes;

        if (
          data.whiteboard?.whiteboardType === WhiteboardType.PUBLIC &&
          mode === ViewMode.SharedWhiteboard
        ) {
          codeRef.current = data.whiteboard.code;
        } else if (
          data.targetUser?.whiteboard.whiteboardType ===
            WhiteboardType.PRIVATE &&
          mode === ViewMode.PersonalWhiteboard
        ) {
          myCodeRef.current = data.targetUser.whiteboard.code;
        } else if (
          mode === ViewMode.Assignment &&
          selectedAssignment === data.userAssignment?.assignment.title
        ) {
          myCodeRef.current = data.userAssignment.whiteboard.code;
          if (
            !assignments.some(
              (assignment: ClassroomUserAssignment) =>
                assignment.assignment.title ===
                data.userAssignment.assignment.title
            )
          ) {
            setAssignments((assignments) => [
              ...assignments,
              data.userAssignment,
            ]);
          } else {
            setAssignments((assignments) =>
              assignments.map((assignment: ClassroomUserAssignment) => {
                if (
                  assignment.assignment.title ===
                  data.userAssignment.assignment.title
                ) {
                  return data.userAssignment;
                }
                return assignment;
              })
            );
          }
        }
      } else if (responseMsg.action === Actions.ASSIGNMENT_CREATE) {
        const newAssignment = responseMsg.data as ClassroomAssignment;
        setAssignments((assignments) => [...assignments, newAssignment]);
      } else if (responseMsg.action === Actions.LOCK_CODE) {
        setIsEditable(false);
      } else if (responseMsg.action === Actions.UNLOCK_CODE) {
        setIsEditable(true);
      } else if (responseMsg.action === Actions.CLASSROOM_DELETED) {
        notifyClassroomDeleted(translations('Classrooms.classroom-deleted'));
        setTimeout(() => {
          toast.dismiss();
          router.replace('/');
        }, 1000);
      } else if (responseMsg.action === Actions.GRADE_ASSIGNMENT) {
        const data = responseMsg.data as ClassroomUserAssignment;
        setAssignments((userAssignments) =>
          userAssignments.map((userAssignment: ClassroomUserAssignment) => {
            if (userAssignment.assignment.title === data.assignment.title) {
              return data;
            }
            return userAssignment;
          })
        );
      }

      setLastAction(responseMsg.action);
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
  ]);

  const runCode = useMemo(
    () =>
      debounce(() => {
        let code: string = null;

        if (mode === ViewMode.SharedWhiteboard) {
          code = codeRef.current;
        } else {
          code = myCodeRef.current;
        }

        try {
          dispatch(sendCode({ content: code }));
        } catch (error) {
          console.error(error);
        }
      }, 1000),
    [dispatch, mode]
  );

  const sendAssignment = (assignment: string) => () => {
    const requestMsg: JsonRequest<string> = {
      action: Actions.SUBMIT_ASSIGNMENT,
      user_id: user.username,
      data: assignment,
    };
    sendJsonMessage(requestMsg);

    setAssignments((assignments) =>
      assignments.map((assignment) => {
        if (assignment.assignment.title === assignment) {
          return { ...assignment, status: AssignmentStatus.SUBMITTED };
        }
        return assignment;
      })
    );
  };

  const returnAssignmentByName = (
    assignmentName: string
  ): ClassroomUserAssignment => {
    return assignments.find(
      (assignment) => assignment.assignment.title === assignmentName
    );
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
                {translations('Classrooms.shared-whiteboard')} -{' '}
                {teacher?.userId}
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
              <h1 className="mb-4 text-center text-2xl font-bold">
                {translations('Classrooms.my-assignments')}
              </h1>
              <div className="flex flex-col space-y-2 rounded-lg border-2 border-neutral-200 p-2 dark:border-neutral-600">
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
                  assignments.map((assignment: ClassroomUserAssignment) => (
                    <Button
                      key={assignment.assignment.id}
                      type="button"
                      onClick={() => {
                        setSelectedAssignment(assignment.assignment.title);
                        setMode(ViewMode.Assignment);
                      }}
                      disabled={
                        selectedAssignment === assignment.assignment.title &&
                        mode === ViewMode.Assignment
                      }
                      variant={ButtonVariant.PRIMARY}>
                      {assignment.assignment.title}
                    </Button>
                  ))}
              </div>
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
              <Button variant={ButtonVariant.FLAT_SECONDARY} onClick={runCode}>
                {translations('Classrooms.run')}
              </Button>

              {mode === ViewMode.Assignment && (
                <>
                  <h4>{selectedAssignment}</h4>
                  {returnAssignmentByName(selectedAssignment)?.status ===
                    AssignmentStatus.SUBMITTED ||
                  returnAssignmentByName(selectedAssignment)?.status ===
                    AssignmentStatus.COMPLETED ? (
                    <>
                      <Button
                        variant={ButtonVariant.PRIMARY}
                        onClick={openFeedbackDialog}>
                        {translations('Classrooms.assignment-feedback-label')}
                      </Button>
                      <StyledDialog
                        title={translations('Classrooms.feedback-dialog-title')}
                        isOpen={isFeedbackDialogOpen}
                        onClose={closeFeedbackDialog}>
                        <div className="py-6">
                          <div className="flex flex-col gap-y-2">
                            <h4>
                              {translations(
                                'Classrooms.assignment-grade-label'
                              )}
                            </h4>
                            {returnAssignmentByName(selectedAssignment)
                              ?.status === AssignmentStatus.COMPLETED ? (
                              <>
                                <ConfettiExplosion
                                  duration={1500}
                                  floorHeight={600}
                                  floorWidth={600}
                                  force={0.4}
                                  particleCount={100}
                                />
                                <div className="text-bold flex h-16 w-full items-center justify-center rounded-lg border-2 bg-neutral-100 text-3xl text-neutral-900 dark:border-neutral-500 dark:bg-neutral-600 dark:text-white">
                                  {
                                    returnAssignmentByName(selectedAssignment)
                                      .grade
                                  }
                                </div>
                                <h4>
                                  {translations(
                                    'Classrooms.assignment-feedback-label'
                                  )}
                                </h4>
                                <div className="flex h-16 w-full items-center justify-center rounded-lg border-2 bg-neutral-100 text-neutral-900 dark:border-neutral-500 dark:bg-neutral-600 dark:text-white ">
                                  {
                                    returnAssignmentByName(selectedAssignment)
                                      .feedback
                                  }
                                </div>
                              </>
                            ) : (
                              <p>
                                {translations('Classrooms.awaiting-review')}
                              </p>
                            )}
                          </div>
                          <div className="mt-6 flex flex-row items-center justify-center">
                            <Button
                              onClick={closeFeedbackDialog}
                              className="mr-2"
                              variant={ButtonVariant.PRIMARY}>
                              {translations('Classrooms.close-dialog')}
                            </Button>
                          </div>
                        </div>
                      </StyledDialog>
                    </>
                  ) : (
                    <Button
                      variant={ButtonVariant.FLAT_SECONDARY}
                      onClick={sendAssignment(selectedAssignment)}>
                      {translations('Classrooms.send-to-review')}
                    </Button>
                  )}
                </>
              )}
            </div>
            <div className="flex h-full flex-col justify-between overflow-hidden">
              <div className="h-auto max-h-96 overflow-scroll">
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
                    assignmentName={
                      selectedAssignment ? selectedAssignment : ''
                    }
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
