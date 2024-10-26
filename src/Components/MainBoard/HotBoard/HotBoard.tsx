import EmptyBoard from "./EmptyBoard";
import BrandIcon from "./BrandIcon";
import NewsItem from "./NewsItem";
import "./HotBoard.styles.scss";
import {useCallback, useMemo} from "react";
import type {News} from "../../../../type/hot";


interface HotBoardProps {
  icon?: string;
  title?: string;
  description?: string;
  url?: string;
  newsList?: News[];
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
  const {icon, title, description, url, newsList, rowSpan, colSpan, keyword, onOpenFrame, index} = props;

  const filterNews = useMemo(() => {
    return newsList?.filter(ele => ele.title.includes(keyword || ''))
  }, [newsList, keyword]);

  const openFrame = useCallback((url: string) => {
    onOpenFrame?.(url);
  }, [onOpenFrame])

  const renderNews = useMemo(() => {
      return (
        filterNews?.map((news, i) => <NewsItem
          onClick={openFrame}
          keyword={keyword} index={i} {...news} key={news.id}/>) || ''
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
        animationDelay: `${(index||0) * 0.1}s`
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
          filterNews?.length ? renderNews : <EmptyBoard/>
        }
      </div>

    </div>
  )
}
