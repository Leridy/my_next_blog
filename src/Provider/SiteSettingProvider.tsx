/**
 * SiteSettingProvider
 * 这是用来共享网站设置的Provider
 */

import React, {createContext, useContext, ReactNode, useEffect, useMemo} from 'react';
import {setting} from '@prisma/client';
import useApi from "@/app/manage/hooks/useApi";
import useSettingMap from "@/Components/hooks/useSettingMap";

interface SiteSettingContextType {
  setting: Map<string, setting>
}

const SiteSettingContext = createContext<SiteSettingContextType | undefined>(undefined);

const SITE_SETTING_KEY = 'SiteSetting';
export const SiteSettingProvider = ({children}: {
  children: ReactNode,
  initialState?: setting[] | null
}) => {
  const {get, items} = useApi<setting>({apiURL: 'setting'});
  const {get: triggerSpiderRefresh} = useApi({
    apiURL: 'spider/trigger',
    headers: {
      'x-ignore-error': 'true'
    }
  })

  const settingMap = useMemo(() => {
    if (!items || items.length === 0) {
      return new Map();
    }
    return new Map(items.map(item => [item.key, item]));
  }, [items]);

  const {interval} = useSettingMap<{interval: number}>({
    baseKey: SITE_SETTING_KEY,
    setting: settingMap,
    subKeys: [
      'interval',
    ]
  })

  const getSettingInterval = useMemo(() => {
    const intervalNumber = Number(interval);
    return isNaN(intervalNumber) || !intervalNumber ? 1000 * 60 : intervalNumber * 1000;
  }, [interval]);

  useEffect(() => {
    get({role: '1'});
    const handler = setInterval(() => {
      get({role: '1'})
    }, getSettingInterval);
    return () => {
      clearInterval(handler);
    }
  }, [get, getSettingInterval]);

  useEffect(() => {
    triggerSpiderRefresh();
  }, [triggerSpiderRefresh]);


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


