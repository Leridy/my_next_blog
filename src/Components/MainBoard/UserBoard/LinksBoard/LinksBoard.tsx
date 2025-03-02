import useSettingMap from '@/Components/hooks/useSettingMap';
import { useSiteSettingContext } from '@/Provider/SiteSettingProvider';
import { useMemo } from 'react';
import { Tooltip } from 'antd';

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

  const renderLinks = useMemo(() => {
    return linkList.map(({ title, url, desc }) => {
      return (
        <Tooltip title={desc} key={title}>
          <a href={url} rel={'noreferrer'} target={'_blank'}>
            {title}
          </a>
        </Tooltip>
      );
    });
  }, [linkList]);

  return <div className={'grid gap-4 grid-cols-3'}>{renderLinks}</div>;
}
