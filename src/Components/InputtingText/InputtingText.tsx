import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './InputtingText.style.scss';

interface InputtingTextProps {
  text?: string;
  cursorBlinkSpeed?: 'slow' | 'fast';
  align?: 'left' | 'center' | 'right';
  hideCursor?: boolean;
}

export default function InputtingText(props: InputtingTextProps) {
  const { text = '', cursorBlinkSpeed = 'slow', align = 'center', hideCursor = false } = props;

  const [curText, setCurText] = useState<string>('');
  const [displayText, setDisplayText] = useState<string[]>(['']);

  const [displayTextState, setDisplayTextState] = useState<'delete' | 'add'>('add');

  const deleteIntervalHandler = useRef<NodeJS.Timeout | null>(null);
  const addIntervalHandler = useRef<NodeJS.Timeout | null>(null);

  const alignType = useMemo(() => {
    switch (align) {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      default:
        return 'center';
    }
  }, [align]);

  /**
   * 做到以下功能，
   * 当 text 变化时，若当前字符串为空，将 text 逐个字符显示出来
   * 若当前字符串不为空，且 text 与当前字符串不同，先将当前 displayText 逐字删除，然后再显示新的 text 逐字显示
   * 其中删除和显示的速度由 cursorBlinkSpeed 控制，slow 为 500ms 一次，fast 为 200ms 一次
   */
  const updateDisplayText = useCallback(() => {
    if (displayTextState === 'delete') {
      clearInterval(addIntervalHandler.current as NodeJS.Timeout);
      deleteIntervalHandler.current = setInterval(
        () => {
          setDisplayText((prev) => {
            if (prev.length === 0) {
              clearInterval(deleteIntervalHandler.current as NodeJS.Timeout);
              return prev;
            } else {
              const next = [...prev];
              next.pop();
              return next;
            }
          });
        },
        cursorBlinkSpeed === 'slow' ? 100 : 50
      );
    } else {
      clearInterval(deleteIntervalHandler.current as NodeJS.Timeout);
      addIntervalHandler.current = setInterval(
        () => {
          setDisplayText((prev) => {
            if (prev.length >= curText.length || prev.join('') === curText) {
              clearInterval(addIntervalHandler.current as NodeJS.Timeout);
              return prev;
            } else {
              const next = [...prev];
              next.push(curText[next.length]);
              return next;
            }
          });
        },
        cursorBlinkSpeed === 'slow' ? 250 : 100
      );
    }
  }, [curText, cursorBlinkSpeed, displayTextState]);

  useEffect(() => {
    updateDisplayText();
  }, [updateDisplayText]);

  useEffect(() => {
    if (text !== curText && displayText.length > 0) {
      setDisplayTextState('delete');
    } else {
      setCurText(text);
      setDisplayTextState('add');
    }
  }, [text, curText, displayText]);

  useEffect(() => {
    return () => {
      clearInterval(deleteIntervalHandler.current as NodeJS.Timeout);
      clearInterval(addIntervalHandler.current as NodeJS.Timeout);
    };
  }, []);

  return (
    <p
      className={`input-blink ${hideCursor ? 'hide-cursor' : ''}`}
      style={{
        justifyContent: alignType,
      }}
      dangerouslySetInnerHTML={{ __html: displayText.join('') }}
    />
  );
}
