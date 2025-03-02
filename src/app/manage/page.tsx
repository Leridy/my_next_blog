'use client';
import HotStatisticBoard from '@/app/manage/Components/HotStatisticBoard';
import SpiderStatisticBoard from '@/app/manage/Components/SpiderStatisticBoard';
import VisitorStatisticBoard from '@/app/manage/Components/VisitorStatisticBoard';
import React from 'react';

export default function ManageHome() {
  // 使用 grid 布局，三行三列
  return (
    <div className={'grid grid-cols-2 gap-4'}>
      <HotStatisticBoard />

      <SpiderStatisticBoard />

      <VisitorStatisticBoard />
    </div>
  );
}
