'use client';
import { Menu, MenuProps } from 'antd';
import {
  DashboardOutlined,
  LineChartOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

const navMenuItems: MenuProps['items'] = [
  {
    key: '/',
    label: '看板',
    // dashboard icon
    icon: <DashboardOutlined />,
  },
  {
    key: 'hot',
    label: '热榜管理',
    icon: <LineChartOutlined />,
  },
  {
    key: 'user',
    label: '用户管理',
    icon: <UserOutlined />,
  },
  {
    key: 'setting',
    label: '设置',
    icon: <SettingOutlined />,
  },
];

export default function NavMenu() {
  // use route
  const pathname = usePathname();
  const router = useRouter();
  const selectedKeys = useMemo(() => {
    const splitPath = pathname?.split('/');
    const currentPath =
      splitPath?.length || 0 >= 3 ? splitPath?.[2] || '' : '/';
    return [currentPath];
  }, [pathname]);

  const handleClick = (e: { key: string }) => {
    router.push(`/manage/${e?.key}`);
  };

  return (
    <Menu
      onClick={handleClick}
      className={'ml-10'}
      theme="dark"
      mode="horizontal"
      selectedKeys={selectedKeys}
      items={navMenuItems}
      style={{ flex: 1, minWidth: 0 }}
    />
  );
}
