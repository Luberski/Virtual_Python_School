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
import { PlusIcon } from '@heroicons/react/24/outline';
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

  const [isDeleteClassroomDialogOpen, setIsDeleteClassroomDialogOpen] =
    useState(false);
  const [isCreateAssignmentDialogOpen, setIsCreateAssignmentDialogOpen] =
    useState(false);
  const socketRef = useRef(null);
  const codeRef = useRef('print("Hello World")');
  const myCodeRef = useRef('print("Hello World")');
  const codeSyncAllowanceRef = useRef(true);

  const [shouldRender, setShouldRender] = useState(false);
  const [validateError, setValidateError] = useState(false);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [currentAssignment, setCurrentAssignment] = useState('');
  const [currentlyAssignedUser, setCurrentlyAssignedUser] = useState('');
  const [currentlyViewedUser, setCurrentlyViewedUser] = useState('');
  const [isEditable, setIsEditable] = useState(false);
  const [isPersonalWhiteboardOpen, setIsPersonalWhiteboardOpen] =
    useState(true);
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
        if (classroomSessionsData[0].is_teacher === false) {
          setValidateError(true);
          notifyUnauthorized(translations('Classrooms.unauthorized'));
          setTimeout(() => {
            toast.dismiss();
            router.replace(
              `/classrooms/${classroomSessionsData[0].classroom_id}/student`
            );
          }, 1000);
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

  const onClassroomDeleteSubmit = async () => {
    try {
      await dispatch(deleteClassroom(parseInt(classroomId)))
        .unwrap()
        .then((result) => {
          if (result.data.id.toString() === classroomId) {
            // Send message to all students that the classroom has been deleted
            socketRef.current.send(
              JSON.stringify({
                action: Actions.CLASSROOM_DELETED,
                user_id: user.username,
                data: null,
              })
            );
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

  const closeDeleteClassroomDialog = () => {
    setIsDeleteClassroomDialogOpen(false);
  };
  const openDeleteClassroomDialog = () => {
    setIsDeleteClassroomDialogOpen(true);
  };

  const onCreateAssignmentSubmit = (data: {
    assignment_name: string;
    assignment_description: string;
  }) => {
    const { assignment_name, assignment_description } = data;
    setValue('assignment_name', '');
    setValue('assignment_description', '');

    socketRef.current.send(
      JSON.stringify({
        action: Actions.ASSIGNMENT_CREATE,
        user_id: user.username,
        data: {
          assignment_name: assignment_name,
          assignment_description: assignment_description,
        },
      })
    );

    setAssignments((assignments) => [...assignments, data]);

    notifyAssignmentCreated(translations('Classrooms.assignment-created'));
    setTimeout(() => {
      toast.dismiss();
      router.replace('/classrooms');
    }, 1000);

    closeCreateAssignmentDialog();
  };

  const closeCreateAssignmentDialog = () => {
    setIsCreateAssignmentDialogOpen(false);
  };
  const openCreateAssignmentDialog = () => {
    setIsCreateAssignmentDialogOpen(true);
  };

  const getUserCode = async (student: string) => {
    socketRef.current.send(
      JSON.stringify({
        action: Actions.GET_DATA,
        user_id: user.username,
        data: {
          target_user: student,
          whiteboard_type: 'private',
        },
      })
    );
  };

  const getUserAssignment = async (
    student: string,
    assignment_name: string
  ) => {
    socketRef.current.send(
      JSON.stringify({
        action: Actions.GET_DATA,
        user_id: user.username,
        data: {
          assignment_name: assignment_name,
          target_user: student,
          whiteboard_type: 'assignment',
        },
      })
    );
  };

  useEffect(() => {
    codeSyncAllowanceRef.current = isEditable;
  }, [isEditable]);

  useEffect(() => {
    const onMessage = (ev: { data: string }) => {
      const recv = JSON.parse(ev.data);

      switch (recv.action) {
        case Actions.SYNC_DATA:
          setUsers(recv.data.users);
          setIsEditable(recv.data.is_editable);
          myCodeRef.current = recv.data.shared_whiteboard;
          setAssignments(recv.data.assignments);
          break;

        case Actions.JOIN:
          setUsers((users) => [...users, recv.data.user_id]);
          notifyUserJoined(
            recv.data.user_id + ' ' + translations('Classrooms.student-joined')
          );
          break;

        case Actions.LEAVE:
          setUsers((users) =>
            users.filter((user) => user !== recv.data.user_id)
          );
          notifyUserLeft(
            recv.data.user_id + ' ' + translations('Classrooms.student-left')
          );
          break;

        case Actions.CODE_CHANGE:
          if (recv.data.whiteboard_type === 'public') {
            myCodeRef.current = recv.data.code;
          } else if (
            recv.data.whiteboard_type === 'private' &&
            recv.data.user_id === currentlyViewedUser &&
            !isPersonalWhiteboardOpen
          ) {
            codeRef.current = recv.data.code;
          } else if (
            recv.data.whiteboard_type === 'assignment' &&
            recv.data.user_id === currentlyAssignedUser &&
            !isPersonalWhiteboardOpen
          ) {
            codeRef.current = recv.data.code;
          }
          break;

        case Actions.GET_DATA:
          if (recv.data.whiteboard_type === 'public') {
            myCodeRef.current = recv.data.code;
          } else if (
            recv.data.target_user === currentlyViewedUser &&
            recv.data.whiteboard_type === 'private'
          ) {
            codeRef.current = recv.data.code;
          } else if (
            recv.data.target_user === currentlyAssignedUser &&
            recv.data.whiteboard_type === 'assignment'
          ) {
            codeRef.current = recv.data.code;
          }
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
            action: Actions.TEACHER_JOIN,
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
      codeSyncAllowanceRef.current = true;
    };

    if (shouldRender && socketRef.current === null) {
      init();
    } else if (shouldRender && socketRef.current !== null) {
      socketRef.current.onmessage = onMessage;
    }

    return () => {
      if (shouldRender && socketRef.current === null) socketRef.current.close();
    };
  }, [
    shouldRender,
    currentlyViewedUser,
    users,
    translations,
    isPersonalWhiteboardOpen,
    classroomId,
    user.username,
    currentlyAssignedUser,
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
                  setIsPersonalWhiteboardOpen(true);
                  setCurrentlyViewedUser('');
                  setCurrentlyAssignedUser('');
                  setCurrentAssignment('');
                  setLastAction(Actions.CODE_CHANGE);
                }}
                disabled={isPersonalWhiteboardOpen}
                variant={ButtonVariant.PRIMARY}>
                {translations('Classrooms.shared-whiteboard')}
              </Button>
              {users?.length > 0 &&
                users.map((u) => (
                  <Button
                    key={u}
                    onClick={() => {
                      setIsPersonalWhiteboardOpen(false);
                      setCurrentlyAssignedUser('');
                      setCurrentlyViewedUser(u);
                      getUserCode(u);
                      setLastAction(Actions.CODE_CHANGE);
                    }}
                    disabled={u === currentlyViewedUser}
                    type="button"
                    variant={ButtonVariant.PRIMARY}>
                    {u}
                  </Button>
                ))}
              <h1 className="mb-4 text-center text-2xl font-bold">
                {translations('Classrooms.assignments')}
              </h1>
              {assignments?.length > 0 &&
                assignments.map((a) => (
                  <>
                    <Button
                      key={a.assignment_name}
                      type="button"
                      onClick={() => {
                        setCurrentAssignment(a.assignment_name);
                      }}
                      disabled={a.assignment_name === currentAssignment}
                      variant={ButtonVariant.PRIMARY}>
                      {a.assignment_name}
                    </Button>
                    {users?.length > 0 &&
                      users.map((u) => (
                        <Button
                          key={u}
                          onClick={() => {
                            setIsPersonalWhiteboardOpen(false);
                            setCurrentlyViewedUser('');
                            setCurrentlyAssignedUser(u);
                            getUserAssignment(u, a.assignment_name);
                            setLastAction(Actions.CODE_CHANGE);
                          }}
                          disabled={u === currentlyAssignedUser}
                          type="button"
                          variant={ButtonVariant.FLAT_SECONDARY}>
                          {u}
                        </Button>
                      ))}
                  </>
                ))}
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
              {!isEditable ? (
                <Button
                  variant={ButtonVariant.FLAT_SECONDARY}
                  disabled={!isPersonalWhiteboardOpen}
                  onClick={() => {
                    setIsEditable(true);
                    socketRef.current.send(
                      JSON.stringify({
                        action: Actions.UNLOCK_CODE,
                        user_id: user.username,
                        data: null,
                      })
                    );
                  }}>
                  {translations('Classrooms.allow-editing')}
                </Button>
              ) : (
                <Button
                  variant={ButtonVariant.FLAT_SECONDARY}
                  disabled={!isPersonalWhiteboardOpen}
                  onClick={() => {
                    setIsEditable(false);
                    socketRef.current.send(
                      JSON.stringify({
                        action: Actions.LOCK_CODE,
                        user_id: user.username,
                        data: null,
                      })
                    );
                  }}>
                  {translations('Classrooms.lock-editing')}
                </Button>
              )}
            </div>
            <div>
              {!isPersonalWhiteboardOpen &&
              (currentlyViewedUser !== '' || currentlyAssignedUser !== '') ? (
                <ClassroomCodeEditor
                  socketRef={socketRef}
                  roomId={classroomId}
                  onCodeChange={(code) => {
                    codeRef.current = code;
                  }}
                  lastAction={lastAction}
                  setLastAction={setLastAction}
                  codeRef={codeRef}
                  user={user}
                  targetUser={
                    currentlyAssignedUser
                      ? currentlyAssignedUser
                      : currentlyViewedUser
                  }
                  isTeacher={true}
                  assignmentName={
                    currentlyAssignedUser ? currentAssignment : ''
                  }
                />
              ) : (
                <ClassroomCodeEditor
                  socketRef={socketRef}
                  roomId={classroomId}
                  onCodeChange={(code) => {
                    myCodeRef.current = code;
                  }}
                  lastAction={lastAction}
                  setLastAction={setLastAction}
                  codeRef={myCodeRef}
                  user={user}
                  isTeacher={true}
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
