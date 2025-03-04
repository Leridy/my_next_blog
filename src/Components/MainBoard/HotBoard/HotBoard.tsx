import EmptyBoard from './EmptyBoard';
import BrandIcon from './BrandIcon';
import NewsItem from './NewsItem';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import useApi from '@/app/manage/hooks/useApi';
import { HotNews, HotSpider } from '@prisma/client';
import { useSiteSettingContext } from '@/Provider/SiteSettingProvider';
import useSettingMap from '@/Components/hooks/useSettingMap';
import { BugOutlined, EyeInvisibleOutlined, EyeOutlined, FullscreenExitOutlined, FullscreenOutlined, MenuOutlined, SyncOutlined } from '@ant-design/icons';
import { useUserSettingContext } from '@/Provider/UserSettingProvider';
import { Button, message, Tooltip } from 'antd';
import { useDrag, useDrop } from 'react-dnd';
import './HotBoard.styles.scss';
import { NetworkError } from '@/http';
import { useNewsContext } from '@/Provider/NewsProvider';

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
  isFocus?: boolean;
  onFocus?: (id: number | null) => void;
  keyword?: string;
  onOpenFrame?: (url: string, id: number, topicId?: number) => void;
  index: number;
  // user setting config
  show?: boolean;
  onMoveItem?: (from: number, to: number) => void;
  onToggleShow?: (id: number) => void;
}

/**
 * HotBoard Component
 * @constructor
 * @description 这个组件是用来展示热门内容的，你需要传入以下信息，然后这个组件会展示出来
 */
export default function HotBoard(props: HotBoardProps) {
  const { id, icon, title, description, rowSpan, colSpan, onFocus, isFocus, keyword, onOpenFrame, index, spiderId, show = false, onMoveItem, onToggleShow } = props;
  const { addOrUpdateCategory } = useNewsContext();
  // 鼠标交互状态
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // 添加鼠标位置和卡片变换状态
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 10,
    shadowOpacity: 0.3,
  });

  const boardRef = useRef<HTMLDivElement>(null);

  const requestRef = useRef<number | null>(null);

  const {
    items: news,
    get: getNewsList,
    loading,
  } = useApi<HotNews>({
    apiURL: 'news',
  });

  useEffect(() => {
    const banTitle = ['IT 之家', '今日头条', '爱范儿', '新浪', '贴吧热榜', '少数派', '51 CTO', '酷安'];
    if (news.length && !banTitle.includes(title)) {
      addOrUpdateCategory({
        title,
        type: description || '',
        // // 取前十条数据
        links: news.slice(0, 10).map((item) => ({
          title: item.title,
          id: String(item.id),
        })),
      });
    }
  }, [news, addOrUpdateCategory]);

  const { get: triggerSpiderRefresh, loading: spiderLoading } = useApi<HotSpider>({
    apiURL: 'spider/trigger',
    headers: {
      'x-ignore-error': 'true',
    },
  });

  const { setting } = useSiteSettingContext();
  const { topicSettingMode } = useUserSettingContext();
  const { pageSize } = useSettingMap<{ pageSize: number }>({
    setting,
    baseKey: SITE_SETTING_KEY,
    subKeys: { pageSize: 20 },
  });

  const filterNews = useMemo(() => {
    return news?.filter((ele) => ele.title.includes(keyword || ''));
  }, [news, keyword]);

  const openFrame = useCallback(
    (url: string, newsId: number) => {
      onOpenFrame?.(url, newsId, id);
    },
    [id, onOpenFrame]
  );

  const [{ isDragging }, ref] = useDrag(
    () => ({
      type: 'HotBoard',
      item: { id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, index]
  );
  const [, drop] = useDrop(
    () => ({
      accept: 'HotBoard',
      hover: (draggedItem: { id: number; index: number }) => {
        if (draggedItem.index !== index) {
          onMoveItem?.(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
    }),
    [onMoveItem, index]
  );

  // 鼠标移动处理
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!boardRef.current) {
        return;
      }

      const rect = boardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 计算鼠标相对卡片中心的位置 (-1 到 1 的范围)
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      // 计算旋转角度 (最大15度)
      const rotateY = mouseX * 5;
      const rotateX = -mouseY * 5;

      // 计算阴影效果
      const shadowX = mouseX * 10;
      const shadowY = mouseY * 10;
      const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
      const shadowBlur = 15 - distance * 5;
      const shadowOpacity = 0.3 + distance * 0.1;

      // 使用requestAnimationFrame更新状态
      if (!requestRef.current) {
        requestRef.current = requestAnimationFrame(() => {
          setTransform({
            rotateX,
            rotateY,
            shadowX,
            shadowY,
            shadowBlur,
            shadowOpacity,
          });
          setPosition({ x, y });
          requestRef.current = null;
        });
      }
    },
    [news?.length, loading, topicSettingMode]
  );

  const handleToggle = useCallback(() => {
    onToggleShow?.(id);
  }, [id, onToggleShow]);

  const handleFullScreen = useCallback(() => {
    if (isFocus) {
      onFocus?.(null);
    } else {
      onFocus?.(id);
    }
  }, [id, isFocus, onFocus]);

  const handleGetNewsList = useCallback(async () => {
    getNewsList({
      spiderId,
      // get today's news
      updatedAt: new Date(new Date().toISOString().split('T')[0]),
      pageSize: Number(pageSize),
      page: 1,
      key: 'hotCount',
      order: 'desc',
    });
  }, [getNewsList, spiderId, pageSize]);

  const handleTriggerSpiderRefresh = useCallback(async () => {
    if (icon && spiderId) {
      try {
        await triggerSpiderRefresh({
          name: icon,
        });
      } catch (e) {
        message.error((e as NetworkError).bizMessage);
      } finally {
        handleGetNewsList();
      }
    }
  }, [handleGetNewsList, icon, spiderId, triggerSpiderRefresh]);

  useEffect(() => {
    // 暂时停止触发
    if (spiderId && show) {
      handleGetNewsList();
    }
  }, [show, spiderId, handleGetNewsList]);

  // 组件卸载时清除动画帧
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const showBoard = useMemo<boolean | undefined>(() => {
    if (topicSettingMode) {
      return true;
    }
    return show;
  }, [show, topicSettingMode]);

  const renderOptionBar = useMemo(() => {
    return (
      <div className={'user-settings'}>
        <Tooltip title={'拖拽我来排序'}>
          <div className={'drag-button'}>
            <MenuOutlined />
          </div>
        </Tooltip>
        <Tooltip title={show ? '不看它' : '看它'}>
          <div
            className={`toggle-button ${show ? '' : 'hide'}`}
            onClick={handleToggle}
          >
            {show ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          </div>
        </Tooltip>
      </div>
    );
  }, [show, handleToggle]);

  const renderNews = useMemo(() => {
    return (
      filterNews
        ?.sort((a, b) => {
          // 判断 hotCount大小排序
          return b.hotCount - a.hotCount;
        })
        .map((newsInfo, i) => (
          <NewsItem
            onClick={openFrame}
            keyword={keyword}
            index={i}
            {...newsInfo}
            key={newsInfo.id}
          />
        )) || ''
    );
  }, [filterNews, keyword, openFrame]);

  // 获取中文提示文字
  const getHintText = () => {
    const hints = ['点', '击', '爬', '虫', '图', '标', '获', '取', '数', '据'];
    return hints[index % hints.length];
  };

  // 计算卡片变换样式
  const cardStyle = useMemo(() => {
    const canAnimate = news?.length || true;
    const baseStyle = {
      willChange: 'transform, box-shadow',
      background: 'var(--color-hot-border-background)',
      gridRow: rowSpan ? `span ${rowSpan}` : undefined,
      gridColumn: colSpan ? `span ${colSpan}` : undefined,
      opacity: isDragging ? 0.5 : undefined,
      display: showBoard ? undefined : 'none',
      position: 'relative' as const,
    };

    if (!canAnimate) {
      return baseStyle;
    }

    const width = boardRef.current?.offsetWidth || 0;
    const height = boardRef.current?.offsetHeight || 0;

    return {
      ...baseStyle,
      transform: isHovered
        ? `perspective(1000px) 
           rotateX(${(position.y - height / 2) / 30}deg) 
           rotateY(${-(position.x - width / 2) / 30}deg)
           translateZ(10px)`
        : 'translateY(0)',
      transition: 'all 0.2s ease-out',
      boxShadow: isHovered
        ? `
            ${(position.x - width / 2) / 40}px 
           ${(position.y - height / 2) / 40}px 
           30px rgba(0,0,0,0.5)`
        : '0px 5px 15px rgba(0,0,0,0.1)',
    };
  }, [news?.length, position, isHovered, rowSpan, colSpan, index, isDragging, showBoard]);

  // 计算文字阴影样式
  const textShadowStyle = useMemo(() => {
    if (news?.length || loading || topicSettingMode) {
      return {
        filter: 'drop-shadow(10px 10px 2px rgba(0,0,0,0.5))',
      };
    }

    const { shadowX, shadowY, shadowBlur, shadowOpacity } = transform;
    const adjustedOpacity = shadowOpacity * 1.5;

    return {
      filter: `drop-shadow(${shadowX * -10}px ${shadowY * -10}px ${shadowBlur * 0.4}px rgba(0,0,0,${adjustedOpacity}))`,
    };
  }, [position, news?.length, loading, topicSettingMode, isHovered]);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      boardRef.current = node;

      if (topicSettingMode) {
        ref(drop(node));
      }
    },
    [topicSettingMode, ref, drop]
  );

  return (
    <div
      className={`widthAnimation ${topicSettingMode ? 'edit-mode' : 'normal'}`}
      style={{
        animationDelay: `${(index || 0) * 0.1}s`,
      }}
    >
      <div
        ref={setRefs}
        className={'p-4 ' + 'rounded-lg ' + 'hotBoard' + 'ard ' + 'flex-col ' + 'sm:h-full ' + `${show ? '' : 'hide'} `}
        style={cardStyle}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!news?.length && !loading && !topicSettingMode && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              fontSize: '200px',
              color: 'rgba(92,92,92,0.4)',
              zIndex: 1,
              ...textShadowStyle,
            }}
          >
            {getHintText()}
          </div>
        )}

        {topicSettingMode && renderOptionBar}
        <div
          className={'flex items-center space-x-2 w-full'}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {icon && <BrandIcon src={icon} />}
          <h3 className={'font-bold'}>{title}</h3>
          <div className={`flex-1 flex justify-end ${topicSettingMode ? 'hidden' : ''}`}>
            <Tooltip title={'触发爬虫'}>
              <Button
                size={'small'}
                type={'link'}
                onClick={handleTriggerSpiderRefresh}
                disabled={loading || spiderLoading || news?.length > 0}
                style={{ display: news.length > 0 ? 'none' : undefined }}
              >
                <BugOutlined />
              </Button>
            </Tooltip>
            <Tooltip title={'刷新'}>
              <Button
                size={'small'}
                type={'link'}
                onClick={handleGetNewsList}
                disabled={loading}
                style={{ display: spiderId ? undefined : 'none' }}
              >
                <SyncOutlined spin={loading} />
              </Button>
            </Tooltip>
            <Tooltip title={isFocus ? '恢复大小' : '放大面版'}>
              <Button
                size={'small'}
                type={'link'}
                onClick={handleFullScreen}
                style={{
                  alignSelf: 'flex-end',
                }}
              >
                {isFocus ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              </Button>
            </Tooltip>
          </div>
        </div>

        <div
          className={'hotBoardNewsList mt-4 mb-4 ' + `${filterNews?.length ? 'fade-in' : ''}`}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {filterNews?.length && !topicSettingMode ? (
            renderNews
          ) : (
            <EmptyBoard
              loading={loading}
              text={topicSettingMode ? '拖动卡片来排序' : undefined}
              icon={
                topicSettingMode ? (
                  <BrandIcon
                    src={icon}
                    size={100}
                  />
                ) : undefined
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
