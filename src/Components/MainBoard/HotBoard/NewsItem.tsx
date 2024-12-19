import './NewsItem.styles.scss';
import {useCallback, useMemo} from "react";
import {HotNews} from "@prisma/client";

export interface NewsItemProps extends HotNews {
  index: number;
  keyword?: string;
  onClick?: (url: string, id: number) => void;
}

/**
 * use gold yellow and red to show the index to make it more eye-catching
 */
const IndexColor = [
  'text-amber-600',
  'text-amber-500',
  'text-amber-400',
]

/**
 * NewsItem Component
 * @constructor
 * @description 这个组件是用来展示新闻的，你需要传入Props 中的信息，然后这个组件会展示出来
 */

export default function NewsItem(props: NewsItemProps) {
  const {index, title, url, tags, hotCount, description, keyword, onClick, id} = props;

  const handleLinkClick = useCallback(() => {
    if (url && onClick) {
      onClick(url, id);
    }
  }, [id, onClick, url])

  const renderExtraData = useMemo(() => {
    // Make number as a number with number unit like 10,000 → 1万, 12000 → 1.2万,
    // and if the number is less than 1000, just show the number.
    // If hotCount is bigger than return 10,000 '🔥' + hotCount / 10,000 + '万' else return hotCount.
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
    let newTitle = title;

    if (keyword) {
      const reg = new RegExp(keyword, 'g');
      newTitle = newTitle.replace(reg, `<span class="bg-amber-200 text-black font-bold">${keyword}</span>`);
    }

    // if there is a keyword, use the keyword to highlight the title.

    // 如果 title 里面包含 红 橙 蓝 那么 进行如下替换
    // 如 “红01” => <span class="bg-red-500 text-white font-bold rounded-md">01</span>
    // 如 “橙01” => <span class="bg-orange-500 text-white font-bold rounded-md">01</span>
    // 如 “蓝01” => <span class="bg-blue-500 text-white font-bold rounded-md">01</span>

    // 如果 title 包含 红 蓝 橙 字符，进行替换
    const colorMap: Record<string, string> = {
      '红': 'bg-red-500',
      '蓝': 'bg-blue-500',
      '橙': 'bg-orange-500'
    };


    for (const color in colorMap) {
      const reg = new RegExp(`${color}(\\d+)`, 'g');
      newTitle = newTitle.replace(reg, (_, num) => {
        return `<span class="${colorMap[color]} text-white font-bold rounded-md px-1">${num}</span>`;
      }).replace(/,/g, ' ');
    }



    return newTitle;
  }, [keyword, title])

  return (
    <div
      title={description || title}
      className={`
            flex items-start 
            ${index < 2 ? 'font-bold' : ''}
            gap-1
            NewsItem-wrapper
            hover:font-bold
            ease-in-out
            mb-2
        `}
    >
      <p className={`w-1/12 NewsItem-news-index text-center ${IndexColor[index]}`}>{index + 1}</p>
      <span
        className={`
            overflow-hidden 
            whitespace-pre-wrap
            flex-1
            height-8
            cursor-pointer
            NewsItem-news-title
            inline-block
          `}
        dangerouslySetInnerHTML={{__html: renderTitleWithHighlight}}
        onClick={handleLinkClick}
        onAuxClick={handleLinkClick}
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
