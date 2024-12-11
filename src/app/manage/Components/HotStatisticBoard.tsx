import {Button, Card} from "antd";
import MyPieChart from "@/app/manage/Components/MyPieChart";
import useApi from "@/app/manage/hooks/useApi";
import {useCallback, useEffect, useMemo} from "react";
import {SyncOutlined} from "@ant-design/icons";
import {useRouter} from "next/navigation";


const headers = {
  'x-no-cache': 'true'
}

interface NewsRankItem {
  newsId: number,
  clickCount: number,
  url: string,
  title: string
}

export default function HotStatisticBoard() {
  const router = useRouter();
  const {get: getNewsRank, items: NewsRank, loading} = useApi<NewsRankItem>({
    apiURL: 'statistic/news',
    headers,
  });
  const {getOne: getNewsStatistic, data: countData, loading: newsStatLoading} = useApi<{
    todayNewsCount: number,
    allNewsCount: number,
  }>({
    apiURL: 'statistic/news',
    headers,
  });

  const {
    getOne: getVisitorStatistic, data: visitorData, loading: visitorStatLoading
  } = useApi<{
    todayClickCount: number,
    allClickCount: number,
  }>({
    apiURL: 'statistic/news',
    headers,
  });

  const {
    getOne: getClickedTopic, data: topicData, loading: topicLoading
  } = useApi<{
    todayClickedNewsCount: number,
  }>({
    apiURL: 'statistic/news',
    headers,
  });


  const handleManage = useCallback(() => {
    router.push('/manage/hot')
  }, [router])

  const renderTitle = useMemo(() => {
    return (
      <div
        className={'flex justify-between items-center'}
      >
        热门数据统计

        <div>
          <Button
            onClick={() => {
              getNewsRank();
              getNewsStatistic('count')
              getVisitorStatistic('visitor')
              getClickedTopic('topic')
            }}
            type={'link'}
            size={'small'}
          >
            <SyncOutlined
              spin={loading || newsStatLoading || visitorStatLoading || topicLoading}
            />
            刷新
          </Button>
          <Button
            type={'link'}
            size={'small'}
            onClick={handleManage}
          >
            管理
          </Button>
        </div>
      </div>
    )
  }, [getClickedTopic, getNewsRank, getNewsStatistic, getVisitorStatistic, handleManage, loading, newsStatLoading, topicLoading, visitorStatLoading]);

  useEffect(() => {
    getNewsRank()
  }, [getNewsRank])

  useEffect(() => {
    getNewsStatistic('count')
  }, [getNewsStatistic])

  useEffect(() => {
    getVisitorStatistic('visitor')
  }, [getVisitorStatistic])

  useEffect(() => {
    getClickedTopic('topic')
  }, [getClickedTopic])

  return (
    <Card
      title={renderTitle}
      size={'small'}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          minHeight: '300px',
          flexWrap: 'wrap',
        }}

      >
        <MyPieChart
          style={{
            height: '300px',
            width: '50%'
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
                  {name: '近24小时点击量', value: visitorData?.todayClickCount},
                  {
                    name: '早前总点击量',
                    value: (visitorData?.allClickCount || 0) - (visitorData?.todayClickCount || 0)
                  }
                ]
              }
            ]
          }}/>

        <MyPieChart
          style={{
            height: '300px',
            width: '50%'
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
                  {name: '今日访问主题数', value: topicData?.todayClickedNewsCount},
                  {name: '今日总主题数', value: countData?.todayNewsCount}
                ]
              }
            ]
          }}/>

        <MyPieChart
          style={{
            height: '300px',
            width: '50%'
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
      </div>


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
  )
}
