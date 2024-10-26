import './NewsItem.styles.scss';
import {useCallback, useMemo} from "react";

export interface News {
  /* 新闻的唯一标识符 */
  id: string;
  /* 新闻的标题 */
  title: string;
  /* 新闻的网页链接 */
  url?: string;
  /* 新闻的描述 */
  description: string;
  /* 新闻的封面图片 */
  cover: string;
  /* 新闻的标签 */
  tags?: string[];
  /* 新闻的发布日期 */
  date?: string;
  /* 新闻的热度 */
  hotCount?: number;
  /* highlight key word */
  keyword?: string;
  /* 点击事件 */
  onClick?: (url: string) => void;
}

export interface NewsItemProps extends News {
  index: number;
}

/**
 * use gold yellow and red to show the index to make it more eye-catching
 */
const IndexColor = [
  'text-amber-700',
  'text-amber-500',
  'text-amber-400',
]

/**
 * NewsItem Component
 * @constructor
 * @description 这个组件是用来展示新闻的，你需要传入Props 中的信息，然后这个组件会展示出来
 */

export default function NewsItem(props: NewsItemProps) {
  const {index, title, url, tags, hotCount, description, keyword, onClick} = props;

  const handleLinkClick = useCallback(() => {
    if (url && onClick) {
      onClick(url);
    }
  }, [url])

  const renderExtraData = useMemo(() => {
    // make number as a number with number unit like 10000 -> 1万， 12000 -> 1.2万, and if the number is less than 1000, just show the number.
    // if hotCount is big than 10000 return '🔥' + hotCount / 10000 + '万' else return hotCount
    const hotCountText = hotCount && hotCount > 10000 ? `🔥${(hotCount / 10000).toFixed(1)}万` : hotCount;
    if (hotCountText && hotCount && hotCount > 10000) return hotCountText;

    if (tags && tags.length) {
      if (tags.length === 1) return tags[0];
      // if there is more than 1 tag, randomly choose one to show.
      return tags[Math.floor(Math.random() * tags.length)];
    }

    return '';
  }, [hotCount, tags])

  const renderTitleWithHighlight = useMemo(() => {
    // if there is a keyword, use the keyword to highlight the title.
    if (keyword) {
      const reg = new RegExp(keyword, 'g');
      return title.replace(reg, `<span class="bg-amber-200">${keyword}</span>`);
    }
    return title;
  }, [keyword, title])

  return (
    <div
      className={`
            flex items-start 
            ${index < 2 ? 'font-bold' : ''}
            gap-1
            title
            hover:text-amber-700
            hover:font-bold
            ease-in-out
        `}
      title={description || title}
    >
      <p className={`w-1/12 ${IndexColor[index]}`}>{index + 1}.</p>
      <span
        rel={'noreferrer'}
        className={`
            overflow-hidden 
            whitespace-pre-wrap
            flex-1
            height-8
            cursor-pointer
          `}
        dangerouslySetInnerHTML={{__html: renderTitleWithHighlight}}
        onClick={handleLinkClick}
      >
      </span>
      <span
        style={{color: 'var(--color-text-secondary)'}}
      >
          {renderExtraData}
      </span>
    </div>
  )
}
