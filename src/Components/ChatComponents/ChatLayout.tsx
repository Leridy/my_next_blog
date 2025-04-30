'use client';
import React, { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { FiMoreHorizontal, FiX } from 'react-icons/fi';
import InputtingText from '@/Components/InputtingText/InputtingText';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  leftContent?: ReactNode;
  centerContent?: ReactNode;
  rightContent?: ReactNode;
}

const Header: FC<HeaderProps> = ({ leftContent = 'HELLO BOSS，你的AI求职军师，开口就是offer敲门砖', centerContent, rightContent }) => {
  const router = useRouter();

  const handleBackToMainBoard = () => {
    router.push('/');
  };

  return (
    <motion.header
      className="h-16 px-4 flex justify-between items-center border-b border-[var(--color-border)] bg-[var(--color-navbar-background)]"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        color: 'var(--color-text-light)',
        gridTemplateColumns: 'auto minmax(0, 1fr) auto',
      }}
      whileHover={{
        backgroundColor: 'var(--color-navbar-background-hover)',
        transition: { duration: 0.2 },
      }}
    >
      <div className="flex items-center min-w-0">{typeof leftContent === 'string' ? <InputtingText text={leftContent} /> : leftContent}</div>

      <motion.div
        className="flex justify-center min-w-0"
        whileHover={{ scale: 1.02 }}
      >
        {centerContent || <span className="text-lg font-semibold truncate">New Chat</span>}
      </motion.div>

      <div className="flex justify-end items-center space-x-2 min-w-0">
        {rightContent || (
          <>
            <motion.button
              className="p-2 rounded-full hover:bg-[var(--color-primary)]"
              whileHover={{
                scale: 1.1,
                backgroundColor: 'var(--color-primary-hover)',
              }}
              whileTap={{ scale: 0.95 }}
              style={{ color: 'inherit' }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <FiMoreHorizontal />
            </motion.button>
            <motion.button
              className="p-2 rounded-full hover:bg-[var(--color-primary)]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{ color: 'inherit' }}
              onClick={handleBackToMainBoard}
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
    if (isLargeScreen) return '300px minmax(0, 1fr) 450px';
    if (isMediumScreen) return '250px minmax(0, 1fr) 300px';
    return 'minmax(0, 1fr)';
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--color-background)]">
      {header}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid flex-1 overflow-hidden"
        style={{
          gridTemplateColumns: getLayoutStyles(),
          width: '100%',
        }}
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

const NormalPanel: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <motion.div
      className="h-full bg-[var(--color-card-background)] shadow-sm backdrop-blur-sm"
      whileHover={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
      transition={{ duration: 0.2 }}
      style={{
        border: '1px solid var(--color-border)',
        color: 'var(--color-text)',
      }}
    >
      <div className="h-full flex flex-col">{children}</div>
    </motion.div>
  );
};

interface AIChatLayoutProps extends HeaderProps {
  sessionPanel?: ReactNode;
  chatPanel: ReactNode;
  configPanel?: ReactNode;
}

const ChatLayout: FC<AIChatLayoutProps> = ({ leftContent, centerContent, rightContent, sessionPanel, chatPanel, configPanel }) => {
  const isSmallScreen = useMediaQuery({ maxWidth: 767 });

  const renderPanel = (panel: ReactNode) => <ScrollablePanel>{panel}</ScrollablePanel>;
  const renderedChatPanel = (panel: ReactNode) => <NormalPanel>{panel}</NormalPanel>;

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
      {renderedChatPanel(chatPanel)}
      {!isSmallScreen && configPanel && renderPanel(configPanel)}
    </CustomLayout>
  );
};

export default ChatLayout;
