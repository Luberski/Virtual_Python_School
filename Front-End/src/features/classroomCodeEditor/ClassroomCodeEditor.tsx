import { useCodeMirror } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { Actions } from '@app/constants';
import React, { useCallback, useRef, useEffect } from 'react';
import type { MutableRefObject } from 'react';
import debounce from 'debounce';

type EditorProps = {
  translations: (key: string) => string;
  socketRef: MutableRefObject<WebSocket>;
  codeRef: MutableRefObject<string>;
  lastAction: number;
  setLastAction: (action: number) => void;
  roomId: string;
  onCodeChange: (value: string) => void;
  user: any;
};

const extensions = [python()];

export default function ClassroomCodeEditor({
  socketRef,
  codeRef,
  onCodeChange,
  lastAction,
  setLastAction,
  user,
}: EditorProps) {
  const editor = useRef();

  const sendData = (value: string) => {
    socketRef.current.send(
      JSON.stringify({
        action: Actions.CODE_CHANGE,
        value: value,
        user_id: user.username,
      })
    );
  };

  const debouncedSendData = debounce((value: string) => sendData(value), 100);

  const onChange = useCallback(
    (value: string) => {
      onCodeChange(value);
      if (
        socketRef.current.readyState === 1 &&
        lastAction !== Actions.CODE_CHANGE &&
        origin !== 'setValue'
      ) {
        debouncedSendData(value);
      }
    },
    [debouncedSendData, lastAction, onCodeChange, socketRef]
  );

  const { setContainer } = useCodeMirror({
    container: editor.current,
    extensions,
    value: codeRef.current,
    onChange: onChange,
  });
  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [setContainer]);

  useEffect(() => {
    if (lastAction === Actions.CODE_CHANGE) {
      setContainer(editor.current);
      setLastAction(Actions.SYNC_CODE);
    }
  }, [codeRef, lastAction, setContainer, setLastAction]);

  return <div ref={editor} />;
}
