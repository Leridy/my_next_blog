import EmptyBoard from "./EmptyBoard";
import BrandIcon from "./BrandIcon";
import NewsItem from "./NewsItem";
import "./HotBoard.styles.scss";
import {useCallback, useEffect, useMemo} from "react";
import useApi from "@/app/manage/hooks/useApi";
import {HotNews} from "@prisma/client";
import {useSiteSettingContext} from "@/Provider/SiteSettingProvider";
import useSettingMap from "@/Components/hooks/useSettingMap";
import {EyeInvisibleOutlined, EyeOutlined, MenuOutlined} from "@ant-design/icons";
import {useUserSettingContext} from "@/Provider/UserSettingProvider";
import {Tooltip} from "antd";
import {useDrag, useDrop} from "react-dnd";

const SITE_SETTING_KEY = 'HotBoard';

export interface HotBoardProps {
  id: number;
  title: string;
  spiderId: number;
  icon?: string;
  description?: string;
  url?: string;
  rowSpan?: number;
  colSpan?: number;
  keyword?: string;
  onOpenFrame?: (url: string) => void;
  index: number;
  // user setting config
  show?: boolean;
  onMoveItem?: (from: number, to: number, itemProps: HotBoardProps) => void;
  onToggleShow?: (id: number) => void;
}

/**
 * HotBoard Component
 * @constructor
 * @description 这个组件是用来展示热门内容的，你需要传入以下信息，然后这个组件会展示出来
 */
export default function HotBoard(props: HotBoardProps) {
  const {
    id,
    icon,
    title,
    rowSpan,
    colSpan,
    keyword,
    onOpenFrame,
    index,
    spiderId,
    show = false,
    onMoveItem,
    onToggleShow
  } = props;
  const {items: news, get: getNewsList, loading} = useApi<HotNews>({
    apiURL: 'news',
  });
  const {setting} = useSiteSettingContext();
  const {topicSettingMode,} = useUserSettingContext();
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

  const [{isDragging}, ref] = useDrag(
    () => ({
      type: 'HotBoard',
      item: {id, index},
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }), [id, index]
  );
  const [, drop] = useDrop(
    () => ({
      accept: 'HotBoard',
      hover: (draggedItem: { id: number; index: number }) => {
        if (draggedItem.index !== index) {
          onMoveItem?.(draggedItem.index, index, props);
          draggedItem.index = index;
        }
      },
    })
    , [onMoveItem, index, props]);

  const handleToggle = useCallback(() => {
    onToggleShow?.(id);
  }, [id, onToggleShow]);

  useEffect(() => {
    // 暂时停止触发
    if (spiderId && show) {
      getNewsList({
        spiderId,
        // get today's news
        updatedAt: new Date(new Date().toISOString().split('T')[0]),
        pageSize: Number(pageSize),
        page: 1,
        key: 'hotCount',
        order: 'desc'
      });
    }
  }, [show, getNewsList, pageSize, spiderId]);


  const showBoard = useMemo<boolean | undefined>(() => {
    if (topicSettingMode) {
      return true
    }
    return show
  }, [show, topicSettingMode])

  const renderOptionBar = useMemo(() => {
    return (
      <div className={'user-settings'}>
        <Tooltip title={'拖拽我来排序'}>
          <div
            className={'drag-button'}
          >
            <MenuOutlined/>
          </div>
        </Tooltip>
        <Tooltip
          title={show ? '不看它' : '看它'}
        >
          <div
            className={`toggle-button ${show ? '' : 'hide'}`}
            onClick={handleToggle}>
            {show ? <EyeInvisibleOutlined/> : <EyeOutlined/>}
          </div>
        </Tooltip>
      </div>
    )
  }, [show, handleToggle])

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
      // @ts-expect-error ref is required here
      ref={topicSettingMode ? (node) => ref(drop(node)) : null}
      className={'p-4 ' +
        'rounded-lg ' +
        'shadow-md ' +
        'hotBoard ' +
        'flex-col ' +
        'hover:shadow-xl ' +
        'sm:h-full ' +
        `${show ? '' : 'hide'} `+
        `${topicSettingMode ? 'edit-mode' : 'normal'}`
      }
      style={{
        background: 'var(--color-hot-border-background)',
        gridRow: rowSpan ? `span ${rowSpan}` : undefined,
        gridColumn: colSpan ? `span ${colSpan}` : undefined,
        animationDelay: `${(index || 0) * 0.1}s`,
        opacity: isDragging ? 0.5 : undefined,
        display: showBoard ? undefined : 'none',
      }}
    >
      {
        topicSettingMode && renderOptionBar
      }
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
          filterNews?.length && !topicSettingMode ? renderNews : <EmptyBoard loading={loading} text={topicSettingMode ? '拖动卡片来排序' : undefined}/>
        }
      </div>


    </div>
  )
}
