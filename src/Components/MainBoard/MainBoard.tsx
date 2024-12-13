import HotBoard from "./HotBoard/HotBoard";
import UserBoard from "@/Components/MainBoard/UserBoard/UserBoard";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import LinkFrame from "@/Components/LinkFrame/LinkFrame";
import useApi from "@/app/manage/hooks/useApi";
import {HotNewsStatistics, HotTopic} from "@prisma/client";
import {useUserSettingContext} from "@/Provider/UserSettingProvider";
import './MainBoard.style.scss';
import ScrollController from "@/Components/MainBoard/ScrollController/ScrollController";
import BrowserFingerprint from "@/Components/BrowserFingerprint/BrowserFingerprint";


interface MainBoardProps {
  keyword: string;
}

/**
 * MainBoard
 * @description 这是用来展示首页所有内容的一个框架
 */
export default function MainBoard(props: MainBoardProps) {
  const {keyword} = props;
  const [openedLink, setOpenedLink] = useState<string>('');
  const [focus, setFocus] = useState<number | null>(null);

  const HotBoardRef = useRef<HTMLDivElement>(null);

  const {get, items} = useApi<HotTopic>({apiURL: 'hot'});
  const {edit: updateNewsStatistics} = useApi<HotNewsStatistics>({
    apiURL: 'statistic/news',
    headers: {
      'x-ignore-error': 'true'
    }
  });

  const {topicSetting, updateTopicSetting} = useUserSettingContext();
  const {order, exclude} = useMemo(() => topicSetting, [topicSetting]);

  const handleOpenLink = useCallback(async (url: string, id: number) => {
    window.open(url, '_blank');
    try {
      await updateNewsStatistics(String(id), {});
    } catch (e) {
      console.error(e);
    }
  }, [updateNewsStatistics]);

  const handleToggleShow = useCallback((id: number) => {
    const newSetting = {
      ...topicSetting,
      exclude: exclude.includes(id) ? exclude.filter(ele => ele !== id) : [...exclude, id]
    }
    updateTopicSetting(newSetting);
  }, [exclude, topicSetting, updateTopicSetting]);


  const TopicItemsToRender = useMemo<HotTopic[]>(() => {
    // 声明一个空数组 newOrderedItems
    const newOrderedItems: HotTopic[] = [];
    // 遍历 items, 首先排除enable 为 false 的项
    const filteredItems = items.filter(item => item.enable);

    // 遍历 filteredItems
    filteredItems.forEach(item => {
      if (order[item.id] !== undefined) {
        newOrderedItems[order[item.id]] = item;
      } else {
        newOrderedItems.push(item);
      }
    });

    return newOrderedItems.filter(ele => ele !== undefined);


  }, [items, order]);


  const handleItemMove = useCallback((from: number, to: number) => {
    // 做一个对 TopicItemsToRender 的深拷贝
    const newTopicItems = [...TopicItemsToRender];
    // 交换 from 和 to 的位置
    const [removed] = newTopicItems.splice(from, 1);
    newTopicItems.splice(to, 0, removed);

    // 通过 newTopicItems 生成新的 order
    const newOrder = {} as Record<number, number>;
    newTopicItems.forEach((topic, index) => {
      newOrder[topic.id] = index;
    });

    // 更新 topicSetting
    const newSetting = {
      ...topicSetting,
      order: newOrder,
    }

    updateTopicSetting(newSetting);
  }, [TopicItemsToRender, topicSetting, updateTopicSetting]);

  const handleScrollUp = useCallback(() => {
    if (HotBoardRef.current) {
      HotBoardRef.current.scrollBy({top: -500, behavior: 'smooth'});
    }
  }, []);

  const handleScrollDown = useCallback(() => {
    if (HotBoardRef.current) {
      HotBoardRef.current.scrollBy({top: 500, behavior: 'smooth'});
    }
  }, []);


  const renderHotBoard = useMemo(() => {
    return (
      TopicItemsToRender.filter(topic => topic.enable).map((topic, i) => <HotBoard
        index={i}
        title={topic.name}
        key={topic.id}
        keyword={keyword}
        {...topic}
        onOpenFrame={handleOpenLink}

        onFocus={setFocus}
        isFocus={focus === topic.id}
        colSpan={focus === topic.id ? 2 : undefined}
        rowSpan={focus === topic.id ? 2 : undefined}

        show={!exclude.includes(topic.id)}
        onMoveItem={handleItemMove}
        onToggleShow={handleToggleShow}
      />)
    )
  }, [TopicItemsToRender, keyword, handleOpenLink, focus, exclude, handleItemMove, handleToggleShow])


  useEffect(() => {
    get();
  }, [get]);

  useEffect(() => {
    if (!topicSetting || Object.keys(topicSetting.order).length === 0) {
      const newOrder = {} as Record<number, number>;
      TopicItemsToRender.forEach((topic, index) => {
        newOrder[topic.id] = index;
      });
      const newSetting = {
        ...topicSetting,
        order: newOrder,
      }
      updateTopicSetting(newSetting);
    }
  }, [TopicItemsToRender, items, topicSetting, updateTopicSetting]);

  return (
    // 使用 grid 布局将 HotBoard 和 UserBoard 放在一起
    <div
      className={'grid grid-cols-5 pt-16 h-full main-board'}
    >
      <div
        className={'relative col-span-5 md:col-span-4 h-full hot-board-wrapper'}
      >
        <div
          ref={HotBoardRef}
          className={
            'relative grid grid-cols-1  gap-6 p-4   ' +
            'sm:grid-cols-2 ' +
            'md:grid-cols-2 ' +
            'lg:grid-cols-3 ' +
            'xl:grid-cols-5 ' +
            'h-full ' +
            'overflow-y-auto'
          }
          style={{
            height: 'calc(100vh - 4rem)',
            overflowY: 'scroll',
          }}
        >
          {renderHotBoard}
        </div>
        <ScrollController
          onScrollUp={handleScrollUp}
          onScrollDown={handleScrollDown}
        />
      </div>


      <div
        className={
          'hidden md:block col-span-1 pl-0 pr-4 pt-4 pb-4 h-full ' +
          'gap-6 overflow-y-scroll relative'
        }
      >
        <UserBoard/>
      </div>


      {
        openedLink && <LinkFrame url={openedLink} onClose={() => setOpenedLink('')} title={'Opened Link'}/>
      }
      <BrowserFingerprint />
    </div>
  )
}
