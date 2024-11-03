/**
 * SiteSettingProvider
 * 这是用来共享网站设置的Provider
 */

import React, {createContext, useContext, ReactNode, useEffect, useMemo} from 'react';
import {setting} from '@prisma/client';
import useApi from "@/app/manage/hooks/useApi";

interface SiteSettingContextType {
  setting: Map<string, setting>
}

const SiteSettingContext = createContext<SiteSettingContextType | undefined>(undefined);

export const SiteSettingProvider = ({children}: {
  children: ReactNode,
  initialState?: setting[] | null
}) => {
  const {get, items} = useApi<setting>({apiURL: 'setting'});

  useEffect(() => {
    get({role: '1'});
    const interval = setInterval(() => {
      get({role: '1'})
    }, 120000);
    return () => {
      clearInterval(interval);
    }
  }, [get]);

  const settingMap = useMemo(() => {
    if (!items || items.length === 0) {
      return new Map();
    }
    return new Map(items.map(item => [item.key, item]));
  }, [items]);

  return (
    <SiteSettingContext.Provider value={{setting: settingMap}}>
      {children}
    </SiteSettingContext.Provider>
  );
};

export const useSiteSettingContext = () => {
  const context = useContext(SiteSettingContext);
  if (!context) {
    throw new Error('useSiteSetting must be used within a SiteSettingProvider');
  }
  return context;
};


