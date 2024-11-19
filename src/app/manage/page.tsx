'use client';
import {Card} from "antd";
import useApi from "@/app/manage/hooks/useApi";
import {useEffect} from "react";
import MyPieChart from "@/app/manage/Components/MyPieChart";

interface NewsRankItem {
  newsId: number,
  clickCount: number,
  url: string,
  title: string
}

export default function ManageHome() {
  const {get: getNewsRank, items: NewsRank} = useApi<NewsRankItem>({
    apiURL: 'statistic/news',
  });
  const {getOne: getSpiderStatus, data: countData} = useApi<{
    todayNewsCount: number,
    allNewsCount: number,
  }>({
    apiURL: 'statistic/news',
  });

  useEffect(() => {
    getNewsRank()
  }, [getNewsRank])

  useEffect(() => {
    getSpiderStatus('count')
  }, [getSpiderStatus])


  // 使用 grid 布局，三行三列
  return (
    <div
      className={'grid grid-cols-2 gap-4'}
    >
      <Card
        title={'热门数据概览'}
        size={'small'}
      >
        <MyPieChart
          style={{
            height: '300px',
            width: '100%'
          }}
          options={{
            series: [
              {
                type: 'pie',
                radius: '70%',
                // center: ['50%', '50%'],
                label: {
                  show: true,
                  formatter: '{b}: {c} ({d}%)'
                },
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 10,
                  borderColor: '#fff',
                  borderWidth: 2
                },
                data: [
                  {name: '今日数据', value: countData?.todayNewsCount},
                  {name: '往日数据', value: (countData?.allNewsCount || 0) - (countData?.todayNewsCount || 0)}
                ]
              }
            ]
          }}/>

        {
          NewsRank.map((item, index) => {
            return (
              <div
                key={index}
                className={'flex justify-between items-center'}
              >
                <a
                  href={item.url}
                  target={'_blank'}
                  rel={'noreferrer'}
                  className={'text-blue-500'}
                >{item.title}</a>
                <span>{item.clickCount}</span>
              </div>
            )
          })
        }
      </Card>
      <Card
        title={'爬虫状态概览'}
        size={'small'}
      >
        展示爬虫的最后更新时间，同时计算爬虫的更新频率
        若爬虫一小时内更新使用绿色标记，
        一小时以上，一天以内使用黄色标记
        一天以上使用红色标记
      </Card>
      <Card
        title={'今日用户活跃度'}
        size={'small'}
      ></Card>
    </div>
  )
}
