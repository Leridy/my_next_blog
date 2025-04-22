'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Tooltip } from 'antd';
import { ReactNode, useState } from 'react';
import useSettingMap from '@/Components/hooks/useSettingMap';
import { useSiteSettingContext } from '@/Provider/SiteSettingProvider';

interface AttractiveButtonProps {
  tooltipContent?: string;
}

const SITE_SETTING_KEY = 'NavBar.HelloBossButton.tooltip';

const HelloBossButton = ({ tooltipContent = '点击探索全新功能' }: AttractiveButtonProps) => {
  const router = useRouter();
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const { setting } = useSiteSettingContext();
  const { tooltip } = useSettingMap<{ tooltip: ReactNode }>({
    setting,
    baseKey: SITE_SETTING_KEY,
    subKeys: {
      tooltip: tooltipContent,
    },
  });

  const handleClick = () => {
    router.push('/hello-boss');
  };

  return (
    <Tooltip
      title={
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {tooltip}
        </motion.div>
      }
      overlayClassName="custom-tooltip"
      open={isTooltipVisible}
      onOpenChange={(visible) => setIsTooltipVisible(visible)}
      color="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
    >
      <motion.div
        initial={{ scale: 1 }}
        whileHover={{
          scale: 1.05,
          boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
        }}
        whileTap={{
          scale: 0.95,
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)',
        }}
        animate={{
          scale: [1, 1.03, 1],
          transition: {
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut',
          },
        }}
        className="inline-block mr-4"
        onHoverStart={() => setIsTooltipVisible(true)}
        onHoverEnd={() => setIsTooltipVisible(false)}
      >
        <Button
          type="primary"
          size="middle"
          onClick={handleClick}
          className="relative overflow-hidden"
          danger
        >
          <motion.span
            className="relative z-10 font-bold"
            whileHover={{ scale: 1.05 }}
          >
            HELLO BOSS
          </motion.span>

          <motion.div
            className="absolute inset-0 bg-blue-500 opacity-0"
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 0.2, scale: 1.2 }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            className="absolute inset-0 bg-white rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            whileTap={{
              scale: 2,
              opacity: 0.3,
              transition: { duration: 0.5 },
            }}
          />
        </Button>
      </motion.div>
    </Tooltip>
  );
};

export default HelloBossButton;
