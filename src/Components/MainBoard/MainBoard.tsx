import HotBoard from "./HotBoard/HotBoard";
import UserBoard from "@/Components/MainBoard/UserBoard/UserBoard";
import {mockedGithub, mockNews} from "@/mock";
import {useCallback, useEffect, useMemo, useState} from "react";
import LinkFrame from "@/Components/LinkFrame/LinkFrame";
import useApi from "@/app/manage/hooks/useApi";
import {HotTopic} from "@prisma/client";

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

  const {get, items} = useApi<HotTopic>({apiURL: 'hot'});

  const handleOpenLink = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  useEffect(() => {
    get();
  }, [get]);

  const renderHotBoard = useMemo(() => {
    return (
      items.map((topic, i) => <HotBoard
        index={i}
        title={topic.name}
        key={topic.id}
        keyword={keyword}
        {...topic}
        onOpenFrame={handleOpenLink}
      />)
    )
  }, [items, keyword, handleOpenLink])

  return (
    // 使用 grid 布局将 HotBoard 和 UserBoard 放在一起
    <div
      className={'grid grid-cols-5 pt-16 h-full'}
    >
      <div
        className={
          'grid grid-cols-1 col-span-5 md:col-span-4 gap-6 p-4  ' +
          'sm:grid-cols-2 ' +
          'md:grid-cols-3 ' +
          'lg:grid-cols-5 ' +
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


      <div
        className={
          'hidden md:block col-span-1 pl-0 pr-4 pt-4 pb-4 h-full ' +
          'gap-6 overflow-y-scroll'
        }
      >
        <UserBoard/>
      </div>


      {
        openedLink && <LinkFrame url={openedLink} onClose={() => setOpenedLink('')} title={'Opened Link'}/>
      }

    </div>
  )
}
