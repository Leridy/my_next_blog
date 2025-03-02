import Card from '@/Components/Card';
import DigitalClock from '@/Components/MainBoard/UserBoard/TipsAndNotification/DigitalClock/DigitalClock';
import { useSiteSettingContext } from '@/Provider/SiteSettingProvider';
import useSettingMap from '@/Components/hooks/useSettingMap';

const SITE_SETTING_KEY = 'UserBoard.Notification';

export default function TipsAndNotification() {
  const { setting } = useSiteSettingContext();

  const { enable, content } = useSettingMap<{
    enable: boolean;
    content: 'string';
  }>({
    baseKey: SITE_SETTING_KEY,
    setting,
    subKeys: ['enable', 'content'],
  }) || { enable: true, content: '' };

  return enable ? (
    <Card header={'提示与通知'}>
      <DigitalClock showDate={true} showTitle={false} />

      <div dangerouslySetInnerHTML={{ __html: content as string }} />
    </Card>
  ) : null;
}
