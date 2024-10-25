import EmptyBoard from "./EmptyBoard";
import BrandIcon from "./BrandIcon";
import NewsItem, {News} from "./NewsItem";
import "./HotBoard.styles.scss";


interface HotBoardProps {
  icon?: string;
  title?: string;
  description?: string;
  url?: string;
  newsList?: News[];
  rowSpan?: number;
  colSpan?: number;
}

/**
 * HotBoard Component
 * @constructor
 * @description 这个组件是用来展示热门内容的，你需要传入以下信息，然后这个组件会展示出来
 */
export default function HotBoard(props: HotBoardProps) {
  const {icon, title, description, url, newsList, rowSpan, colSpan} = props;

  const renderNews = () => {
    return (
      newsList?.map((news, i) => <NewsItem index={i} {...news} key={news.id}/>)
    )
  }

  return (
    <div
      className={'p-4 rounded-lg shadow-md hotBoard flex-col'}
      style={{
        background: 'var(--color-hot-border-background)',
        gridRow: `span ${rowSpan || 1}`,
        gridColumn: `span ${colSpan || 1}`,
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
        className={'hotBoardNewsList mt-4 mb-4 flex-1'}>
        {
          newsList?.length ? renderNews() : <EmptyBoard/>
        }
      </div>

    </div>
  )
}
