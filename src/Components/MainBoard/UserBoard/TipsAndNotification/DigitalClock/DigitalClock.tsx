import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface DigitalClockProps {
  title?: string;
  showDate?: boolean;
  showTitle?: boolean;
}

export default function DigitalClock(props: DigitalClockProps) {
  const { title, showDate, showTitle } = props;

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    function loop() {
      setTime(new Date());
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }, []);

  return (
    <motion.div
      className={'flex flex-col items-center mb-4'}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {showTitle && (
        <motion.h1
          className={'text-2xl font-bold mb-2'}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {title || 'Digital Clock'}
        </motion.h1>
      )}

      <div className="flex flex-col items-center">
        {showDate && (
          <motion.span
            className={'text-xl font-medium text-gray-600 dark:text-gray-300'}
            key={time.toLocaleDateString()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {time.toLocaleDateString()}
          </motion.span>
        )}

        <motion.span
          className={'text-2xl font-bold bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] bg-clip-text text-transparent'}
          key={time.toLocaleTimeString()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {time.toLocaleTimeString()}
        </motion.span>
      </div>
    </motion.div>
  );
}
