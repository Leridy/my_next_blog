import Card from '@/Components/Card';
import { useSiteSettingContext } from '@/Provider/SiteSettingProvider';
import useSettingMap from '@/Components/hooks/useSettingMap';
import { motion } from 'framer-motion';

const SITE_SETTING_KEY = 'UserBoard.CopyrightBoard';
const defaultContent = `<p>
    资讯来源于对应源网站，©️ Copyright 由原网站所有，本站仅保存和提供其标题和链接，
    本站不对所提供资讯的真实性、准确性、可靠性、完整性和及时性做出任何承诺和保证。
    如有侵权，请邮件联系 vuejs@189.cn 删除。
    <br/>
    <br/>
    ©️ Copyright 除资讯内容外，本站所有内容均为划水网所有。
    <br/>
    <br/>
    Powered by <a href={'https://vercel.com/'} target={'_blank'} rel={'noreferrer'}>Vercel</a>
    and <a href={'https://nextjs.org/'} target={'_blank'} rel={'noreferrer'}>Next.js</a>
  </p>`;

export default function CopyrightBoard() {
  const { setting } = useSiteSettingContext();
  const { content } = useSettingMap<{ content: string }>({
    baseKey: SITE_SETTING_KEY,
    setting,
    subKeys: {
      content: defaultContent,
    },
  });

  return (
    <Card header={'版权声明'}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="prose dark:prose-invert max-w-none text-sm p-4 rounded-lg"
        style={{
          background: 'var(--color-transparent-background)',
          color: 'var(--color-text-secondary)',
        }}
        dangerouslySetInnerHTML={{ __html: String(content) }}
        whileHover={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          scale: 1.01,
        }}
      />
    </Card>
  );
}
