'use client';
import {Menu, MenuProps} from "antd";
import {useMemo} from "react";
import {usePathname, useRouter} from "next/navigation";
import Sider from "antd/es/layout/Sider";

type SideMenuType = 'hot' | 'user' | 'setting';

export interface SideMenuItem extends Record<SideMenuType, MenuProps['items']> {
}

export const sideMenuData: SideMenuItem = {
  hot: [
    {
      key: 'hot',
      label: '热榜列表',
    },
    {
      key: 'hot/create',
      label: '创建热榜信息',
    },
  ],
  user: [
    {
      key: 'user',
      label: '用户管理',
    },
    {
      key: 'user/create',
      label: '创建用户',
    }
  ],
  setting: [
    {
      key: 'setting',
      label: '设置',
    },
  ],
}

export default function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();

  const parentPath = useMemo<SideMenuType>(() => {
    return pathname.split('/')[2] as SideMenuType;
  }, [pathname]);

  const childPath = useMemo(() => {
    const splitPath = pathname.split('/');
    return splitPath.length >= 3 ? splitPath[3] : '';
  }, [pathname]);

  const currentMenu = useMemo(() => {
    // get menu index from pathname
    return sideMenuData[parentPath as SideMenuType];
  }, [parentPath]);

  const selectedKeys = useMemo(() => {
    return [[parentPath, childPath].filter(Boolean).join('/')];
  }, [parentPath, childPath]);

  function handleClick(e: any) {
    // use router to navigate
    router.push(`/manage/${e.key}`);

  }

  return (
    currentMenu ? (
      <Sider
        width={200}
      >
        <Menu
          onClick={handleClick}
          mode="inline"
          selectedKeys={selectedKeys}
          style={{height: '100%', borderRight: 0}}
          items={currentMenu}
        />
      </Sider>
    ) : null
  );
}
