/**
 * @file AddToFavoritesButton.tsx
 * @brief AddToFavoritesButton component
 * @date 2024-12-13
 * @description 使用 antd 的 Button 组件实现一个添加到收藏夹的按钮
 * 点击按钮后，将自动唤起浏览器的收藏夹添加功能，将当前页面添加到收藏夹
 * @note 注意：该组件仅在浏览器环境下有效, 并且需要支持多种主流浏览器
 */

import { Button, Tooltip } from 'antd';
import { useCallback } from 'react';
import { StarFilled } from '@ant-design/icons';

export default function AddToFavoritesButton() {
  const handleAddToFavorites = useCallback(() => {
    if (window.external && 'AddFavorite' in window.external) {
      // IE Favorite
      // @ts-expect-error IE Favorite
      window.external.AddFavorite(window.location.href, document.title);
      // @ts-expect-error sidebar may not support
    } else if (window.sidebar && window.sidebar.addPanel) {
      // Firefox <23
      // @ts-expect-error Firefox <23
      window.sidebar.addPanel(document.title, window.location.href, '');
      // @ts-expect-error opera may not support
    } else if (window.opera && window.print) {
      // Opera <15
      // @ts-expect-error Opera
      this.title = document.title;
      return true;
    } else {
      // Other browsers (mainly WebKit - Chrome/Safari), 要注意 Mac 用户的按键规则, 使用 mac 的 cmd 的符号来表示 Command 键
      if (window.navigator.userAgent.toLowerCase().indexOf('mac') !== -1) {
        alert('请按 “⌘ + D” 添加到收藏夹');
      } else {
        alert('请按 Ctrl + D 添加到收藏夹');
      }
    }
  }, []);

  return (
    <Tooltip
      title={'添加到收藏夹'}
      key={'add-to-favorites'}
    >
      <Button
        type={'link'}
        onClick={handleAddToFavorites}
      >
        <StarFilled />
      </Button>
    </Tooltip>
  );
}
