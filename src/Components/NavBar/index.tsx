'use client';
import UserBox from './UserBox/UserBox';
import { Input } from 'antd';
import { useSiteSettingContext } from '@/Provider/SiteSettingProvider';
import InputtingText from '@/Components/InputtingText/InputtingText';
import useSettingMap from '@/Components/hooks/useSettingMap';

interface NavBarProps {
  onSearch?: (value: string) => void;
}

const SITE_SETTING_KEY = 'NavBar';

export default function NavBar(props: NavBarProps) {
  const { onSearch } = props;
  const { setting } = useSiteSettingContext();

  const { name } = useSettingMap<{ name: string }>({
    setting,
    baseKey: SITE_SETTING_KEY,
    subKeys: ['name'],
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value.split(' ').join(''));
  };

  return (
    // 分成一行四列

    <nav className="grid w-full p-4 text-white grid-cols-3 gap-4 items-center fixed" style={{ background: 'var(--color-navbar-background)' }}>
      <h1 className="text-2xl font-bold">{name ? <InputtingText key={String(name)} align={'left'} text={String(name)} /> : <InputtingText key={'default'} align={'left'} text={'划水吧'} />}</h1>

      <Input placeholder="在本页筛选..." onChange={handleSearch} />

      <UserBox />
    </nav>
  );
}
