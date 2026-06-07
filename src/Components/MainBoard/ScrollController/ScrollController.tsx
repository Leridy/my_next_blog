/**
 * 使用 antd 实现两个竖直排列的按钮
 * 点击按钮后抛出 onScrollDown 和 onScrollUp 事件
 * 不需要考虑滚动条的位置
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

interface ScrollControllerProps {
  onScrollDown?: () => void;
  onScrollUp?: () => void;
}

export default function ScrollController(props: ScrollControllerProps) {
  const { onScrollDown, onScrollUp } = props;
  const [isScrolling, setIsScrolling] = useState(false);
  const timer = useRef<number | null>(null);

  const handleScrollDown = useCallback(() => {
    if (isScrolling) return;
    setIsScrolling(true);
    onScrollDown?.();
    timer.current = window.setTimeout(() => {
      setIsScrolling(false);
    }, 500);
  }, [isScrolling, onScrollDown]);

  const handleScrollUp = useCallback(() => {
    if (isScrolling) return;
    setIsScrolling(true);
    onScrollUp?.();
    timer.current = window.setTimeout(() => {
      setIsScrolling(false);
    }, 500);
  }, [isScrolling, onScrollUp]);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  return (
    <div className={'absolute right-0 top-1/2 flex-col flex scroll-controller z-20'}>
      <Button
        shape={'circle'}
        icon={<ArrowUpOutlined />}
        onClick={handleScrollUp}
        className={'mb-2'}
      />
      <Button
        shape={'circle'}
        icon={<ArrowDownOutlined />}
        onClick={handleScrollDown}
      />
    </div>
  );
}
