import useSettingMap from '@/Components/hooks/useSettingMap';
import { useSiteSettingContext } from '@/Provider/SiteSettingProvider';
import { useMemo } from 'react';
import { Tooltip } from 'antd';
import { motion } from 'framer-motion';

const SITE_SETTING_KEY = 'UserBoard.LinksBoard';

export default function LinksBoard() {
  const { setting } = useSiteSettingContext();

  const { links } = useSettingMap<{ links: string }>({
    baseKey: SITE_SETTING_KEY,
    setting,
    subKeys: {
      links: '🪨 网站里程碑 - https://docs.qq.com/doc/DTU5GbEVFTURpT05i\n🙏 特别鸣谢 - https://docs.qq.com/doc/DTVRYd0VXSmV5a2Va',
    },
  });

  const linkList = useMemo(() => {
    return String(links)
      ?.split(';\n')
      .map((link) => {
        const [title, url, desc] = link.split(' - ');
        return { title, url, desc };
      });
  }, [links]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3'}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {linkList.map(({ title, url, desc }) => (
        <motion.div
          key={title}
          variants={item}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <Tooltip title={desc}>
            <a
              href={url}
              rel={'noreferrer'}
              target={'_blank'}
              className="flex items-center justify-center text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              {title}
            </a>
          </Tooltip>
        </motion.div>
      ))}
    </motion.div>
  );
}
