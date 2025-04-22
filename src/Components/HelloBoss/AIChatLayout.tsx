'use client';
import React, { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { FiMoreHorizontal, FiX } from 'react-icons/fi';
import InputtingText from '@/Components/InputtingText/InputtingText';

interface HeaderProps {
  leftContent?: ReactNode;
  centerContent?: ReactNode;
  rightContent?: ReactNode;
}

const Header: FC<HeaderProps> = ({ leftContent = 'HELLO BOSS，你的AI求职军师，开口就是offer敲门砖', centerContent, rightContent }) => {
  return (
    <motion.header
      className="h-16 px-4 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-navbar-background)]"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ color: 'var(--color-text-light)' }}
    >
      <div className="flex-1 flex items-center">{typeof leftContent === 'string' ? <InputtingText text={leftContent} /> : leftContent}</div>
      <motion.div
        className="flex-1 flex justify-center"
        whileHover={{ scale: 1.02 }}
      >
        {centerContent || <span className="text-lg font-semibold">New Chat</span>}
      </motion.div>

      <div className="flex-1 flex justify-end items-center space-x-2">
        {rightContent || (
          <>
            <motion.button
              className="p-2 rounded-full hover:bg-[var(--color-primary)]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{ color: 'inherit' }}
            >
              <FiMoreHorizontal />
            </motion.button>
            <motion.button
              className="p-2 rounded-full hover:bg-[var(--color-primary)]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{ color: 'inherit' }}
            >
              <FiX />
            </motion.button>
          </>
        )}
      </div>
    </motion.header>
  );
};

const CustomLayout: FC<{
  children: ReactNode;
  header?: ReactNode;
}> = ({ children, header }) => {
  const isLargeScreen = useMediaQuery({ minWidth: 1280 });
  const isMediumScreen = useMediaQuery({ minWidth: 768, maxWidth: 1279 });

  const getLayoutStyles = () => {
    if (isLargeScreen) return 'grid-cols-[300px_1fr_450px]';
    if (isMediumScreen) return 'grid-cols-[250px_1fr_300px]';
    return 'grid-cols-[1fr]';
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--color-background)]">
      {header}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`grid ${getLayoutStyles()}  flex-1 overflow-hidden`}
      >
        {children}
      </motion.div>
    </div>
  );
};

const ScrollablePanel: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <motion.div
      className="h-full overflow-y-auto bg-[var(--color-card-background)] shadow-sm backdrop-blur-sm"
      whileHover={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: 'var(--color-transparent-background)',
      }}
      transition={{ duration: 0.2 }}
      style={{
        border: '1px solid var(--color-border)',
        color: 'var(--color-text)',
      }}
    >
      <div className="h-full">{children}</div>
    </motion.div>
  );
};

interface AIChatLayoutProps extends HeaderProps {
  sessionPanel?: ReactNode;
  chatPanel: ReactNode;
  configPanel?: ReactNode;
}

const AIChatLayout: FC<AIChatLayoutProps> = ({ leftContent, centerContent, rightContent, sessionPanel, chatPanel, configPanel }) => {
  const isSmallScreen = useMediaQuery({ maxWidth: 767 });

  const renderPanel = (panel: ReactNode) => <ScrollablePanel>{panel}</ScrollablePanel>;

  return (
    <CustomLayout
      header={
        <Header
          leftContent={leftContent}
          centerContent={centerContent}
          rightContent={rightContent}
        />
      }
    >
      {!isSmallScreen && sessionPanel && renderPanel(sessionPanel)}
      {renderPanel(chatPanel)}
      {!isSmallScreen && configPanel && renderPanel(configPanel)}
    </CustomLayout>
  );
};

export default AIChatLayout;
