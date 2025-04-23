import { motion } from 'framer-motion';
export default function LoadingPanel() {
  // using tailwindcss and framer-motion to create a loading panel
  return (
    <motion.div
      className="flex items-center justify-center h-full bg-[var(--color-card-background)] shadow-sm backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 border-4 border-t-4 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-500">加载中...</span>
      </div>
    </motion.div>
  );
}
