// 初始化一个nextjs 空 page (全高全宽，使用 tailwind) 然后引入 WIPComponent

import React from 'react';
import WIPComponent from '@/Components/WIPComponent/WIPComponent';

export default function HelloBoss() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <WIPComponent message={'🚧 👷 🏗️ 划水网，正在整个大的 Hello Boss 功能横空出世， 敬请期待...'} />
    </div>
  );
}
