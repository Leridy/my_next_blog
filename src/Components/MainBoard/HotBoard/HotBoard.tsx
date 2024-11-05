import EmptyBoard from "./EmptyBoard";
import BrandIcon from "./BrandIcon";
import NewsItem from "./NewsItem";
import "./HotBoard.styles.scss";
import {useCallback, useEffect, useMemo} from "react";
import useApi from "@/app/manage/hooks/useApi";
import {HotNews} from "@prisma/client";
import {useSiteSettingContext} from "@/Provider/SiteSettingProvider";
import useSettingMap from "@/Components/hooks/useSettingMap";

const SITE_SETTING_KEY = 'HotBoard';

interface HotBoardProps {
  title: string;
  spiderId: number;
  icon?: string;
  description?: string;
  url?: string;
  rowSpan?: number;
  colSpan?: number;
  keyword?: string;
  onOpenFrame?: (url: string) => void;
  index?: number;
}

/**
 * HotBoard Component
 * @constructor
 * @description 这个组件是用来展示热门内容的，你需要传入以下信息，然后这个组件会展示出来
 */
export default function HotBoard(props: HotBoardProps) {
  const {icon, title, rowSpan, colSpan, keyword, onOpenFrame, index, spiderId} = props;
  const {items: news, get: getNewsList, loading} = useApi<HotNews>({
    apiURL: 'news',
  });
  const {setting} = useSiteSettingContext();
  const {pageSize} = useSettingMap<{ pageSize: number }>({
    setting,
    baseKey: SITE_SETTING_KEY,
    subKeys: {pageSize: 20}
  })

  const filterNews = useMemo(() => {
    return news?.filter(ele => ele.title.includes(keyword || ''))
  }, [news, keyword]);

  const openFrame = useCallback((url: string) => {
    onOpenFrame?.(url);
  }, [onOpenFrame]);

  useEffect(() => {
    getNewsList({
      spiderId,
      // get today's news
      updatedAt: new Date(new Date().toISOString().split('T')[0]),
      pageSize: Number(pageSize),
      page: 1,
      key: 'hotCount',
      order: 'desc'
    });
  }, [getNewsList, pageSize, spiderId]);

  const renderNews = useMemo(() => {
      return (
        filterNews?.map((newsInfo, i) => <NewsItem
          onClick={openFrame}
          keyword={keyword} index={i} {...newsInfo} key={newsInfo.id}/>) || ''
      )
    }, [filterNews, keyword, openFrame]
  )

  return (
    <div
      className={'p-4 rounded-lg shadow-md hotBoard flex-col hover:shadow-xl'}
      style={{
        background: 'var(--color-hot-border-background)',
        gridRow: `span ${rowSpan || 1}`,
        gridColumn: `span ${colSpan || 1}`,
        animationDelay: `${(index || 0) * 0.1}s`
      }}
    >
      <div
        className={'flex items-center space-x-2'}
      >

        {
          icon && <BrandIcon src={icon}/>
        }
        <h3
          className={'font-bold'}
        >{title}</h3>
      </div>

      <div
        className={
          'hotBoardNewsList mt-4 mb-4 ' +
          'overflow-y-scroll' +
          `${filterNews?.length ? 'fade-in' : ''}`
        }
      >
        {
          filterNews?.length ? renderNews : <EmptyBoard loading={loading}/>
        }
      </div>


    </div>
  )
}
