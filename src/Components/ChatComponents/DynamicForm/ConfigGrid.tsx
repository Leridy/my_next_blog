import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfigCard } from './ConfigCard';
import { Configuration } from '@/IndexedDB/AIChat/types';
import BuyMeCoffee from '@/Components/BuyMeCoffee';
import { Empty } from 'antd';
import CommentsBoard from '@/Components/CommentsBoard';

interface ConfigGridProps {
  configurations: Configuration[];
  onEdit: (config: Configuration) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export const ConfigGrid: React.FC<ConfigGridProps> = ({ configurations, onEdit, onDelete, loading = false }) => {
  // 动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        when: 'beforeChildren',
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-[var(--color-text-secondary)]">加载中...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence mode="popLayout">
        {configurations.length === 0 ? (
          <motion.div
            key="empty-state"
            className="col-span-full flex flex-col items-center justify-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span className="text-[var(--color-text-secondary)]">暂无配置，点击创建新配置</span>}
            />
          </motion.div>
        ) : (
          <>
            {configurations.map((config) => (
              <motion.div
                key={config.id}
                layout
                layoutId={`config-${config.id}`}
                variants={itemVariants}
                exit="exit"
                className="h-full"
              >
                <ConfigCard
                  config={config}
                  onEdit={() => onEdit(config)}
                  onDelete={() => onDelete(config.id)}
                />
              </motion.div>
            ))}
            <motion.div
              key="buy-me-coffee"
              layout
              variants={itemVariants}
              className="h-full md:col-span-2 lg:col-span-3 xl:col-span-4"
            >
              <BuyMeCoffee />
            </motion.div>

            <motion.div
              key="buy-me-coffee"
              layout
              variants={itemVariants}
              className="h-full md:col-span-2 lg:col-span-3 xl:col-span-4"
            >
              <CommentsBoard />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
