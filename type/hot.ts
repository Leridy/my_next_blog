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

export interface HotTopic {
  id: number | string;
  name?: string;
  icon: string;
  description?: string;
  url?: string;
  image?: string;
  newsList?: News[],
  createdAt?: string;
  updatedAt?: string;
}

