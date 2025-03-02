import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { RiAlipayFill } from 'react-icons/ri';
import { BsWechat } from 'react-icons/bs';

// 支付方式类型
type PaymentMethod = 'wechat' | 'alipay';

const BuyMeCoffee = () => {
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('wechat');
  const [isFlipped, setIsFlipped] = useState(false);

  // 切换支付方式
  const togglePaymentMethod = (method: PaymentMethod) => {
    if (method !== activeMethod) {
      setIsFlipped(true);
      setTimeout(() => {
        setActiveMethod(method);
        setIsFlipped(false);
      }, 300);
    }
  };

  // 品牌色
  const brandColors = {
    wechat: '#2BAE67', // 微信绿
    alipay: '#00A0E9', // 支付宝蓝
  };

  return (
    <div className="flex flex-col items-center user-select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden bg-opacity-80 dark:bg-opacity-50 cursor-progress"
        style={{
          backgroundColor: 'var(--color-card-background)',
        }}
      >
        <div className="p-6">
          <h3
            className="text-lg font-medium text-center mb-4"
            style={{ color: 'var(--color-text)' }}
          >
            如果我的工作对你有帮助，请我喝杯咖啡吧 ☕️
          </h3>

          {/* 支付方式选择器 */}
          <div className="flex justify-center space-x-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${activeMethod === 'wechat' ? 'text-white shadow-md' : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700'}`}
              style={{
                backgroundColor: activeMethod === 'wechat' ? brandColors.wechat : '',
              }}
              onClick={() => togglePaymentMethod('wechat')}
            >
              <BsWechat
                className="w-5 h-5 mr-2"
                fill={activeMethod === 'wechat' ? 'white' : brandColors.wechat}
              />
              微信支付
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${activeMethod === 'alipay' ? 'text-white shadow-md' : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700'}`}
              style={{
                backgroundColor: activeMethod === 'alipay' ? brandColors.alipay : '',
              }}
              onClick={() => togglePaymentMethod('alipay')}
            >
              <RiAlipayFill
                className="w-5 h-5 mr-2"
                fill={activeMethod === 'alipay' ? 'white' : brandColors.alipay}
              />
              支付宝
            </motion.button>
          </div>

          {/* 支付二维码展示区 */}
          <div className="relative w-64 h-64 mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMethod}
                initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="absolute top-0 left-0 w-full h-full rounded-lg overflow-hidden"
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div
                  className="w-full h-full p-3 rounded-lg"
                  style={{
                    backgroundColor: activeMethod === 'wechat' ? 'rgba(43, 174, 103, 0.1)' : 'rgba(0, 160, 233, 0.1)',
                    border: `2px solid ${activeMethod === 'wechat' ? brandColors.wechat : brandColors.alipay}`,
                  }}
                >
                  <Image
                    src={`/image/${activeMethod === 'wechat' ? 'wechatPay.png' : 'alipay.png'}`}
                    alt={activeMethod === 'wechat' ? '微信支付' : '支付宝'}
                    width={250}
                    height={250}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            className="mt-4 text-center text-sm opacity-75"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            扫描{activeMethod === 'wechat' ? '微信' : '支付宝'}二维码，请我喝咖啡
          </div>
        </div>

        {/* 底部装饰 */}
        <div
          className="h-2"
          style={{ backgroundColor: activeMethod === 'wechat' ? brandColors.wechat : brandColors.alipay }}
        ></div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        className="mt-3 text-xs text-center"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        感谢您的支持，让我能继续开发更多功能
      </motion.div>
    </div>
  );
};

export default BuyMeCoffee;
