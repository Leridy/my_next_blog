// ConfigGrid.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfigCard } from './ConfigCard';
import { Configuration } from '@/IndexedDB/HelloBoss/types';
import BuyMeCoffee from '@/Components/BuyMeCoffee';

interface ConfigGridProps {
  configurations: Configuration[];
  onEdit: (config: Configuration) => void;
  onDelete: (id: string) => void;
}

export const ConfigGrid: React.FC<ConfigGridProps> = ({ configurations, onEdit, onDelete }) => {
  // 动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9 },
  };

  return (
    <motion.div
      className="grid grid-cols-1 flex-1
        gap-4 overflow-y-auto p-2"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence>
        {configurations.map((config) => (
          <motion.div
            key={config.id}
            layout
            variants={itemVariants}
            exit="exit"
            transition={{ type: 'spring', damping: 20 }}
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
          key={'buy-me-coffee'}
          layout
          variants={itemVariants}
          exit="exit"
          transition={{ type: 'spring', damping: 20 }}
          className="h-full"
          style={{
            height: '500px',
          }}
        >
          <BuyMeCoffee />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
