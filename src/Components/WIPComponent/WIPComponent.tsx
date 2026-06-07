'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from 'antd';
import InputtingText from '@/Components/InputtingText/InputtingText';

interface WIPComponentProps {
  message?: string;
}

const WIPComponent: React.FC<WIPComponentProps> = ({ message = '正在施工中，敬请期待...' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = () => {
    setIsAnimating((perv) => !perv);
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-8"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
      }}
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.1 : 1,
          rotate: isAnimating ? [0, -10, 10, -5, 5, 0] : 0,
        }}
        transition={{ type: 'spring', stiffness: 300 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={startAnimation}
        className="cursor-pointer mb-6"
      >
        <Tooltip
          title="点击互动"
          color="var(--color-tertiary)"
        >
          <svg
            width="140"
            height="140"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 施工锥 */}
            <motion.path
              d="M24 6L6 42H42L24 6Z"
              stroke="var(--color-secondary)"
              strokeWidth="2"
              fill="var(--color-primary)"
              animate={{
                opacity: isHovered ? 1 : 0.9,
                fill: isAnimating ? 'var(--color-quaternary)' : 'var(--color-primary)',
              }}
            />

            {/* 条纹 */}
            <motion.rect
              x="20"
              y="16"
              width="8"
              height="4"
              rx="1"
              fill="var(--color-text-light)"
              animate={{
                y: isAnimating ? [16, 18, 16] : 16,
              }}
              transition={{ repeat: isAnimating ? Infinity : 0, duration: 0.5 }}
            />
            <motion.rect
              x="20"
              y="24"
              width="8"
              height="4"
              rx="1"
              fill="var(--color-text-light)"
              animate={{
                y: isAnimating ? [24, 26, 24] : 24,
              }}
              transition={{ repeat: isAnimating ? Infinity : 0, duration: 0.5, delay: 0.2 }}
            />
            <motion.rect
              x="20"
              y="32"
              width="8"
              height="4"
              rx="1"
              fill="var(--color-text-light)"
              animate={{
                y: isAnimating ? [32, 34, 32] : 32,
              }}
              transition={{ repeat: isAnimating ? Infinity : 0, duration: 0.5, delay: 0.4 }}
            />

            {/* 施工标志 */}
            <motion.path
              d="M14 30L10 34M10 30L14 34"
              stroke="var(--color-text-dark)"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{
                strokeWidth: isHovered ? 3 : 2,
              }}
            />
            <motion.path
              d="M38 30L34 34M34 30L38 34"
              stroke="var(--color-text-dark)"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{
                strokeWidth: isHovered ? 3 : 2,
              }}
            />

            {/* 闪烁的施工灯 */}
            <motion.circle
              cx="24"
              cy="12"
              r="3"
              fill="var(--color-success)"
              animate={{
                opacity: isAnimating ? [0.3, 1, 0.3] : 0.7,
                scale: isAnimating ? [1, 1.2, 1] : 1,
              }}
              transition={{ repeat: isAnimating ? Infinity : 0, duration: 1 }}
            />
          </svg>
        </Tooltip>
      </motion.div>

      <motion.p
        className="text-center max-w-md"
        style={{ fontSize: 'var(--text-size)' }}
        animate={{
          color: isHovered ? 'var(--color-tertiary)' : 'var(--color-text)',
        }}
      >
        <InputtingText
          text={message}
          cursorBlinkSpeed={'fast'}
        />
      </motion.p>

      <motion.div
        className="mt-6 flex space-x-4"
        animate={{
          opacity: isHovered ? 1 : 0.7,
        }}
      >
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: 'var(--color-primary)' }}
          whileHover={{ scale: 1.5 }}
        />
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: 'var(--color-secondary)' }}
          whileHover={{ scale: 1.5 }}
        />
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: 'var(--color-tertiary)' }}
          whileHover={{ scale: 1.5 }}
        />
      </motion.div>
    </div>
  );
};

export default WIPComponent;
