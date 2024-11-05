import './NewsItem.styles.scss';
import {useCallback, useMemo} from "react";
import {HotNews} from "@prisma/client";

export interface NewsItemProps extends HotNews {
  index: number;
  keyword?: string;
  onClick?: (url: string) => void;
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
      return title.replace(reg, `<span class="bg-amber-200 text-black font-bold">${keyword}</span>`);
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
            hover:font-bold
            ease-in-out
        `}
      title={description || title}
    >
      <p className={`w-1/12 text-right ${IndexColor[index]}`}>{index + 1}.</p>
      <span
        className={`
            overflow-hidden 
            whitespace-pre-wrap
            flex-1
            height-8
            cursor-pointer
            news-title
            inline-block
          `}
        dangerouslySetInnerHTML={{__html: renderTitleWithHighlight}}
        onClick={handleLinkClick}
        data-title={title}
      />
      <span
        style={{color: 'var(--color-text-secondary)'}}
      >
          {renderExtraData}
      </span>
    </div>
  )
}
