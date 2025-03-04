import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

// 类型定义
interface LinkData {
  title: string;
  id: string;
}

export interface LinkCategory {
  title: string;
  type: string;
  links: LinkData[];
}

// 创建上下文
interface NewsContextType {
  categories: LinkCategory[];
  addOrUpdateCategory: (category: LinkCategory) => void;
}

const NewsContext = createContext<NewsContextType | null>(null);

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [newsMap, setNewsMap] = useState<Record<string, LinkCategory>>({});

  // 添加或更新分类（全量覆盖对应类型的数据）
  const addOrUpdateCategory = useCallback((category: LinkCategory) => {
    setNewsMap((prev) => ({
      ...prev,
      [category.title]: category,
    }));
  }, []);

  // 将 newsMap 转换为数组形式
  const categories = useMemo(() => {
    return Object.values(newsMap);
  }, [newsMap]);

  // 提供上下文值
  const contextValue = useMemo(
    () => ({
      categories,
      addOrUpdateCategory,
    }),
    [categories, addOrUpdateCategory]
  );

  useEffect(() => {
    console.log('categories:', categories);
  }, [categories]);

  return <NewsContext.Provider value={contextValue}>{children}</NewsContext.Provider>;
};

// 自定义Hook，用于在组件中访问新闻上下文
export const useNewsContext = (): NewsContextType => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews必须在NewsProvider内部使用');
  }
  return context;
};
