import HotBoard from "./HotBoard";
import UserBoard from "@/Components/MainBoard/UserBoard";
import {mockedGithub, mockNews} from "@/mock";

/**
 * MainBoard
 * @description 这是用来展示首页所有内容的一个框架
 */
export default function MainBoard() {
  return (
    // 使用 grid 布局将 HotBoard 和 UserBoard 放在一起
    <div
      className={'grid grid-cols-5 pt-16'}
    >
      <div
        className={'grid grid-cols-1 col-span-5 md:col-span-4 gap-6 p-4  ' +
          'sm:grid-cols-2 ' +
          'md:grid-cols-3 ' +
          'lg:grid-cols-5 ' +
          'grid-rows-3 h-full'}
      >
        <HotBoard
          title={'知乎日报'}
          icon={'zhihu'}
          newsList={mockNews}
        />
        <HotBoard
          title={'V2EX'}
          icon={'v2ex'}
          newsList={[...mockNews].reverse()}
        />
        <HotBoard
          title={'Github'}
          icon={'github'}
          newsList={mockedGithub}
        />
        <HotBoard
          title={'掘金'}
          icon={'juejin'}
        />
        <HotBoard
          title={'微博热搜'}
          icon={'weibo'}
        />
        <HotBoard
          title={'IT之家'}
          icon={'ithome'}
        />
        <HotBoard
          title={'头条'}
          icon={'toutiao'}
        />
        <HotBoard
          title={'抖音'}
          icon={'tiktok'}
        />
        <HotBoard
          title={'中关村在线'}
          icon={'zol'}
        />
        <HotBoard
          title={'36氪'}
          icon={'36kr'}
        />
        <HotBoard
          title={'虎扑步行街'}
          icon={'hupu'}
        />
        <HotBoard
          title={'新浪'}
          icon={'sina'}
        />
        <HotBoard
          title={'虎嗅'}
          icon={'huxiu'}
        />
        <HotBoard
          title={'什么值得买'}
          icon={'smzdm'}
        />
        <HotBoard
          title={'豆瓣'}
          icon={'douban'}
        />
        <HotBoard
          title={'B站'}
          icon={'bilibili'}
        />
      </div>
      <div
        className={'hidden md:block col-span-1'}
      >
        <UserBoard/>
      </div>

    </div>
  )
}
