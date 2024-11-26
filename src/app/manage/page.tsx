'use client';
import {Card} from "antd";
import HotStatisticBoard from "@/app/manage/Components/HotStatisticBoard";
import SpiderStatisticBoard from "@/app/manage/Components/SpiderStatisticBoard";


export default function ManageHome() {


  // 使用 grid 布局，三行三列
  return (
    <div
      className={'grid grid-cols-2 gap-4'}
    >
      <HotStatisticBoard/>

      <SpiderStatisticBoard/>


      <Card
        title={'今日用户活跃度'}
        size={'small'}
      ></Card>
    </div>
  )
}
