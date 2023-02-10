import { useCodeMirror } from '@uiw/react-codemirror';
import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';
import { python } from '@codemirror/lang-python';
import { Actions, ViewMode, WhiteboardType } from '@app/constants';
import React, { useCallback, useRef, useEffect } from 'react';
import type { MutableRefObject } from 'react';
import debounce from 'debounce';
import { useTheme } from 'next-themes';
import type { JsonValue } from 'react-use-websocket/dist/lib/types';
import { ReadyState } from 'react-use-websocket/dist/lib/constants';

type EditorProps = {
  connState: ReadyState;
  sendMsg: (jsonMessage: JsonValue) => void;
  codeRef: MutableRefObject<string>;
  lastAction: number;
  setLastAction: (action: number) => void;
  roomId: string;
  onCodeChange: (value: string) => void;
  mode: ViewMode;
  user: any;
  targetUser?: any;
  isEditable?: boolean;
  isTeacher: boolean;
  assignmentName?: string;
};

const editorLightTheme = createTheme({
  theme: 'light',
  settings: {
    background: '#ffffff',
    foreground: '#75baff',
    caret: '#5d00ff',
    selection: '#036dd626',
    selectionMatch: '#036dd626',
    lineHighlight: '#8a91991a',
    gutterBackground: '#fff',
    gutterForeground: '#8a919966',
  },
  styles: [
    { tag: t.comment, color: '#787b8099' },
    { tag: t.variableName, color: '#0080ff' },
    { tag: [t.string, t.special(t.brace)], color: '#5c6166' },
    { tag: t.number, color: '#5c6166' },
    { tag: t.bool, color: '#5c6166' },
    { tag: t.null, color: '#5c6166' },
    { tag: t.keyword, color: '#5c6166' },
    { tag: t.operator, color: '#5c6166' },
    { tag: t.className, color: '#5c6166' },
    { tag: t.definition(t.typeName), color: '#5c6166' },
    { tag: t.typeName, color: '#5c6166' },
    { tag: t.angleBracket, color: '#5c6166' },
    { tag: t.tagName, color: '#5c6166' },
    { tag: t.attributeName, color: '#5c6166' },
  ],
});

const editorDarkTheme = createTheme({
  theme: 'dark',
  settings: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    caret: '#d7ba7d',
    selection: '#264f7840',
    selectionMatch: '#264f7840',
    lineHighlight: '#0000001a',
    gutterBackground: '#1e1e1e',
    gutterForeground: '#8a919966',
  },
  styles: [
    { tag: t.comment, color: '#6a9955' },
    { tag: t.variableName, color: '#569cd6' },
    { tag: [t.string, t.special(t.brace)], color: '#ce9178' },
    { tag: t.number, color: '#b5cea8' },
    { tag: t.bool, color: '#b5cea8' },
    { tag: t.null, color: '#b5cea8' },
    { tag: t.keyword, color: '#569cd6' },
    { tag: t.operator, color: '#d4d4d4' },
    { tag: t.className, color: '#4ec9b0' },
    { tag: t.definition(t.typeName), color: '#4ec9b0' },
    { tag: t.typeName, color: '#4ec9b0' },
    { tag: t.angleBracket, color: '#4ec9b0' },
    { tag: t.tagName, color: '#569cd6' },
    { tag: t.attributeName, color: '#9cdcfe' },
  ],
});

export default function ClassroomCodeEditor({
  connState,
  sendMsg,
  codeRef,
  onCodeChange,
  lastAction,
  setLastAction,
  user,
  roomId,
  mode,
  isEditable = true,
  isTeacher,
  targetUser = null,
  assignmentName = '',
}: EditorProps) {
  const { theme } = useTheme();

  const extensions = [python()];

  const editor = useRef();

  const sendData = (value: string) => {
    sendMsg({
      action: Actions.CODE_CHANGE,
      user_id: user.username,
      data: {
        whiteboard_type: WhiteboardType.PUBLIC,
        code: value,
      },
    });
  };

  const debouncedSendData = debounce((value: string) => sendData(value), 100);

  const sendPersonalData = (value: string) => {
    sendMsg({
      action: Actions.CODE_CHANGE,
      user_id: user.username,
      data: {
        whiteboard_type: WhiteboardType.PRIVATE,
        code: value,
      },
    });
  };

  const debouncedSendPersonalData = debounce(
    (value: string) => sendPersonalData(value),
    100
  );

  const sendPersonalAssignmentData = (value: string) => {
    sendMsg({
      action: Actions.CODE_CHANGE,
      user_id: user.username,
      data: {
        assignment_name: assignmentName,
        whiteboard_type: WhiteboardType.ASSIGNMENT,
        code: value,
      },
    });
  };

  const debouncedSendPersonalAssignmentData = debounce(
    (value: string) => sendPersonalAssignmentData(value),
    100
  );

  const sendDataToUser = (value: string) => {
    sendMsg({
      action: Actions.CODE_CHANGE,
      user_id: user.username,
      data: {
        target_user: targetUser,
        whiteboard_type: WhiteboardType.PRIVATE,
        code: value,
      },
    });
  };

  const debouncedSendDataToUser = debounce(
    (value: string) => sendDataToUser(value),
    100
  );

  const sendAssignmentDataToUser = (value: string) => {
    sendMsg({
      action: Actions.CODE_CHANGE,
      user_id: user.username,
      data: {
        target_user: targetUser,
        assignment_name: assignmentName,
        whiteboard_type: WhiteboardType.ASSIGNMENT,
        code: value,
      },
    });
  };

  const debouncedSendAssignmentDataToUser = debounce(
    (value: string) => sendAssignmentDataToUser(value),
    100
  );

  const onChange = useCallback(
    (value: string) => {
      onCodeChange(value);
      if (
        connState === ReadyState.OPEN &&
        lastAction !== Actions.CODE_CHANGE &&
        origin !== 'setValue'
      ) {
        if (
          mode === ViewMode.PersonalWhiteboard &&
          !isTeacher &&
          assignmentName === ''
        ) {
          debouncedSendPersonalData(value);
        } else if (
          mode === ViewMode.ViewUserWhiteboard &&
          isTeacher &&
          targetUser !== null
        ) {
          debouncedSendDataToUser(value);
        } else if (
          (mode === ViewMode.Assignment && assignmentName) !== '' &&
          isTeacher &&
          targetUser !== null
        ) {
          debouncedSendAssignmentDataToUser(value);
        } else if (
          mode === ViewMode.Assignment &&
          assignmentName !== '' &&
          !isTeacher
        ) {
          debouncedSendPersonalAssignmentData(value);
        } else {
          debouncedSendData(value);
        }
      }
    },
    [
      assignmentName,
      connState,
      debouncedSendAssignmentDataToUser,
      debouncedSendData,
      debouncedSendDataToUser,
      debouncedSendPersonalAssignmentData,
      debouncedSendPersonalData,
      isTeacher,
      lastAction,
      mode,
      onCodeChange,
      targetUser,
    ]
  );

  const { setContainer } = useCodeMirror({
    container: editor.current,
    extensions,
    value: codeRef.current,
    onChange: onChange,
    editable: isEditable,
    theme: theme === 'dark' ? editorDarkTheme : editorLightTheme,
  });
  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [setContainer, isEditable]);

  useEffect(() => {
    if (lastAction === Actions.CODE_CHANGE) {
      setContainer(editor.current);
      setLastAction(Actions.NONE);
    }
  }, [codeRef, lastAction, setContainer, setLastAction]);

  return <div ref={editor} />;
}
