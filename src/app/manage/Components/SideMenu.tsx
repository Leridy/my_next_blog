'use client';
import {Menu, MenuProps} from "antd";
import {useMemo} from "react";
import {usePathname, useRouter} from "next/navigation";
import Sider from "antd/es/layout/Sider";
import {MenuInfo} from "rc-menu/lib/interface";

type SideMenuType = 'hot' | 'user' | 'setting';

export type SideMenuItem = Record<SideMenuType, MenuProps['items']>

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
    {
      key: 'hot/spider',
      label: '爬虫管理',
    },
    {
      key: 'hot/news',
      label: '新闻管理',
    }
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
    return pathname?.split('/')[2] as SideMenuType;
  }, [pathname]);

  const childPath = useMemo(() => {
    const splitPath = pathname?.split('/');
    return splitPath?.length || 0 >= 3 ? splitPath?.[3] : '';
  }, [pathname]);

  const currentMenu = useMemo(() => {
    // get menu index from pathname
    return sideMenuData[parentPath as SideMenuType];
  }, [parentPath]);

  const selectedKeys = useMemo(() => {
    return [[parentPath, childPath].filter(Boolean).join('/')];
  }, [parentPath, childPath]);

  function handleClick(e: MenuInfo) {
    // use router to navigate
    router.push(`/manage/${e.key}`);

  }

  return (
    currentMenu ? (
        <Sider
          width={200}
          className="bg-white"
          style={{height: 'calc(100vh - 64px)'}}
        >

          <Menu
            onClick={handleClick}
            mode="inline"
            selectedKeys={selectedKeys}
            style={{height: '100%', borderRight: 0, padding: 4}}
            items={currentMenu}
          />
        </Sider>
      ) :
      null
  )
    ;
}
